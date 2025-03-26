import {
  reactExtension,
  useBuyerJourneyIntercept,
  DateField,
  useApplyAttributeChange,
  Banner,
  Text,
  Spinner,
  BlockStack,
} from '@shopify/ui-extensions-react/checkout';
import { useState, useCallback } from "react";

export default reactExtension(
  'purchase.checkout.contact.render-after',
  () => <ExtensionDatepicker />,
);

function ExtensionDatepicker() {
  const applyAttributeChange = useApplyAttributeChange();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState(false);  

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    setTouched(true); 
    
    if (!dateOfBirth) {
      setErrorMessage("❌ Please enter your date of birth");
      return {
        behavior: canBlockProgress ? "block" : "allow",
        reason: "Date of birth is required to verify your age.",
      };
    }

    const selectedDate = new Date(dateOfBirth);
    const today = new Date();
    const minValidDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

    if (isNaN(selectedDate.getTime())) {
      return {
        behavior: canBlockProgress ? "block" : "allow",
        reason: "Please enter a valid date format.",
      };
    }

    if (selectedDate > minValidDate) {
      return {
        behavior: canBlockProgress ? "block" : "allow",
        reason: "Sorry, you must be at least 18 years old to place an order.",
      };
    }

    return { behavior: "allow" };
  });

  const handleChange = useCallback(async (newValue) => {
    setTouched(true);
    
    if (!newValue) {
      setErrorMessage("Please enter your date of birth");
      return;
    }

    const selectedDate = new Date(newValue);
    const today = new Date();
    const minValidDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxValidDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());

    if (isNaN(selectedDate.getTime())) {
      setErrorMessage("Invalid date format");
      return;
    }

    if (selectedDate > minValidDate) {
      setErrorMessage("You must be at least 18 years old to proceed");
      return;
    }

    if (selectedDate < maxValidDate) {
      setErrorMessage("Please enter a realistic birth date");
      return;
    }

    setErrorMessage("");
    setDateOfBirth(newValue);
    setIsLoading(true);

    try {
      await applyAttributeChange({
        type: "updateAttribute",
        key: "dateOfBirth",
        value: newValue,
      });
    } catch (error) {
      setErrorMessage("Error saving date of birth");
      console.error("Attribute update failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <BlockStack>
      <DateField
        label="Enter Date of Birth"
        value={dateOfBirth}
        onChange={handleChange}
        inputMode="date"
        disabled={[{start: "2010-01-01"}]}
        required
        
        border={touched && !dateOfBirth ? "critical" : undefined}
        error={touched && !dateOfBirth} 
      />
      
      {isLoading && <Spinner />}
      {errorMessage && (
        <Banner status="critical">
          {errorMessage}
        </Banner>
      )}
    </BlockStack>
  );
}