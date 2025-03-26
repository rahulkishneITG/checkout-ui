// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const NO_CHANGES = {
  operations: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */


export function run(input) {
  const bundleGroups = {};
  input.cart.lines.forEach(line => {
    const bundleId = line.bundleID?.value || 'no-bundle';
    if (!bundleGroups[bundleId]) {
      bundleGroups[bundleId] = [];
    }
    bundleGroups[bundleId].push(line);
  });

  const operations = [];
  for (const [bundleId, lines] of Object.entries(bundleGroups)) {
    if (lines.length > 1 && bundleId !== 'no-bundle') {
      operations.push({
        merge: {
          cartLines: lines.map(line => ({
            cartLineId: line.id,
            quantity: line.quantity || 1,
          })),
          parentVariantId: "gid://shopify/ProductVariant/8017563648137",
          price: { percentageDecrease: { value: 10.5 } },
          title: "Meal Kit Bundle",
        },
      });
      
    }
  }

  return operations.length > 0 ? { operations } : NO_CHANGES;
}


// export function run(input) {
//   const bundleMap = new Map();
//   input.cart.lines.forEach(line => {
//     const bundleId = line.bundleID?.value || 'no-bundle';
//     if (!bundleMap.has(bundleId)) {
//       bundleMap.set(bundleId, []);
//     }
//     bundleMap.get(bundleId).push(line);
//   });

//   const operations = [];
//   for (const [bundleId, lines] of bundleMap) {
//     if (bundleId === 'no-bundle' || lines.length <= 1) continue;
//     operations.push({
//       merge: {
//         cartLines: lines.map(line => ({
//           cartLineId: line.id,
//           quantity: line.quantity || 1,
//         })),
//         parentVariantId: "gid://shopify/ProductVariant/49794092368178",
//         price: { percentageDecrease: { value: 10.5 } },
//         title: "Meal Kit Bundle",
//         image: { url: "https://team-gamma-checkout-extension.myshopify.com/cdn/shop/files/Main_0a4e9096-021a-4c1e-8750-24b233166a12.jpg?v=1740464414&width=300" },
//       },
//     });
//   }

//   return operations.length > 0 ? { operations } : NO_CHANGES;
// }