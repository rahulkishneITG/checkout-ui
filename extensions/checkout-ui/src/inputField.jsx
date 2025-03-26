import {
    reactExtension,
    Checkbox,
    TextField,
    useApplyAttributeChange,
    useInstructions,
    useApplyMetafieldsChange
  } from '@shopify/ui-extensions-react/checkout';
  
  // 1. Choose an extension target
  export default reactExtension(
    'purchase.checkout.reductions.render-before',
    () => <Extension />,
  );
  import { useState } from "react";
  function Extension() {
    const applyAttributeChange = useApplyAttributeChange();
    const metafield = useApplyMetafieldsChange();
    const instructions = useInstructions();
    const [value, setValue] = useState("");
  
    // 2. Render UI with both Checkbox and TextField
    return (
      <>
        <Checkbox onChange={onCheckboxChange}>
          I would like to receive a free gift with my order
        </Checkbox>
        <TextField
          label="Special Instructions"
          onChange={onTextFieldChange}
        />
      </>
    );
  
    async function onCheckboxChange(isChecked) {
      if (!instructions.attributes.canUpdateAttributes) {
        console.error(
          'Attributes cannot be updated in this checkout',
        );
        return;
      }
      
      const result = await applyAttributeChange({
        key: 'requestedFreeGift',
        type: 'updateAttribute',
        value: isChecked ? 'yes' : 'no',
      });
     
    }
  
    async function onTextFieldChange(value) {
      console.log('onTextFieldChange', value);
      setValue(value);
      metafield({
        namespace: 'custom',
        key: 'special_instructions',
        type: 'updateMetafield',
        value: value,
        valueType:"string",
      });
     
    }
  }