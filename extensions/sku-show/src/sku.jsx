import {
    reactExtension,
    Text,
    useCartLineTarget,
  } from '@shopify/ui-extensions-react/checkout';
  
  export default reactExtension(
    'purchase.checkout.cart-line-item.render-after',
    () => <Extension />,
  );
  
  function Extension() {
    const {
      merchandise: {sku},
    } = useCartLineTarget();
    return <Text>SKU: {sku}</Text>;
  }
  