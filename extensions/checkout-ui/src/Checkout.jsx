// import {
//   reactExtension,
//   useApplyCartLinesChange,
//   useCartLineTarget,
//   Text,
//   BlockStack,
//   InlineLayout,
//   Stepper,
// } from '@shopify/ui-extensions-react/checkout';
// import { useState, useCallback } from 'react';
// import { debounce } from 'lodash'; // Import debounce from lodash

// export default reactExtension(
//   'purchase.checkout.cart-line-item.render-after',
//   () => <Extension />,
// );

// function Extension() {
//   const line = useCartLineTarget();
//   const applyCartLineChange = useApplyCartLinesChange();
//   const [quantity, setQuantity] = useState(line.quantity);

//   const debouncedUpdateCart = useCallback(
//     debounce(async (lineId, newQuantity) => {
//       try {
//         await applyCartLineChange({
//           type: 'updateCartLine',
//           id: lineId,
//           quantity: parseInt(newQuantity),
//         });
//       } catch (error) {
//         console.error('Error updating cart line:', error);
//         setQuantity(line.quantity);
//       }
//     }, 300),
//     [applyCartLineChange]
//   );

//   const handleQuantityChange = useCallback(
//     (newQuantity) => {
//       const parsedQuantity = Math.max(0, parseInt(newQuantity) || 0); 
//       setQuantity(parsedQuantity);
//       debouncedUpdateCart(line.id, parsedQuantity);
//     },
//     [line.id, debouncedUpdateCart]
//   );

//   return (
//     <BlockStack spacing="loose">
//       <Text>Quantity</Text>
//       <InlineLayout columns={['fill', 'auto']} spacing="base">
//         <Stepper
//           label="Quantity"
//           type="number"
//           min={0} // Prevent negative values
//           value={quantity}
//           onChange={handleQuantityChange}
//         />
//       </InlineLayout>
//     </BlockStack>
//   );
// }

import {
  reactExtension,
  useApplyCartLinesChange,
  useCartLineTarget,
  Text,
  BlockStack,
  InlineLayout,
  Stepper,
  Checkbox,
} from '@shopify/ui-extensions-react/checkout';
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

export default reactExtension(
  'purchase.checkout.cart-line-item.render-after',
  () => <Extension />,
);

function Extension() {
  const line = useCartLineTarget();
  const applyCartLineChange = useApplyCartLinesChange();
  const [quantity, setQuantity] = useState(line.quantity);
  const [giftWrap, setGiftWrap] = useState(false); // Add gift wrap state

  const debouncedUpdateCart = useCallback(
    debounce(async (lineId, newQuantity, includeGiftWrap) => {
      try {
        
        const attributes = includeGiftWrap 
          ? [{ key: 'Gift Wrap', value: 'Yes' }]
          : [];

        await applyCartLineChange({
          type: 'updateCartLine',
          id: lineId,
          quantity: parseInt(newQuantity),
          attributes: attributes, 
        });
      } catch (error) {
        console.error('Error updating cart line:', error);
        setQuantity(line.quantity);
        setGiftWrap(false); 
      }
    }, 300),
    [applyCartLineChange]
  );

  const handleQuantityChange = useCallback(
    (newQuantity) => {
      const parsedQuantity = Math.max(0, parseInt(newQuantity) || 0);
      setQuantity(parsedQuantity);
      debouncedUpdateCart(line.id, parsedQuantity, giftWrap);
    },
    [line.id, giftWrap, debouncedUpdateCart]
  );

  const handleGiftWrapChange = useCallback(
    (checked) => {
      setGiftWrap(checked);
      debouncedUpdateCart(line.id, quantity, checked);
    },
    [line.id, quantity, debouncedUpdateCart]
  );

  return (
    <BlockStack spacing="loose">
      <Text>Quantity</Text>
      <InlineLayout columns={['fill', 'auto']} spacing="base">
        <Stepper
          label="Quantity"
          type="number"
          min={0}
          value={quantity}
          onChange={handleQuantityChange}
        />
      </InlineLayout>
      <Checkbox
        id={`gift-wrap-${line.id}`}
        name="giftWrap"
        checked={giftWrap}
        onChange={handleGiftWrapChange}
      >
        Add Gift Wrap
      </Checkbox>
    </BlockStack>
  );
}