// import {
//     Avatar,
//     InlineStack,
//     reactExtension,
//   } from '@shopify/ui-extensions-react/customer-account';
//   import React from 'react';

//   export default reactExtension(
//     'customer-account.profile.block.render',
//     () => <App />,
//   );

//   function App() {
//     return (
//       <InlineStack spacing="large500">
//         <Avatar alt="John Doe" />
//         <Avatar initials="EW" alt="Evan Williams" />
//       </InlineStack>
//     );
//   }

// import {
//     useApi,
//     TextField,
//     Text,
//     Image,
//     BlockStack,
//     reactExtension,
// } from '@shopify/ui-extensions-react/customer-account';
// import { useState } from 'react';

// // Define the extension target
// export default reactExtension('customer-account.profile.block.render', () => <ProfileEditor />);

// function ProfileEditor() {
//     const { query, customer } = useApi();

//     // State for customer's name and profile image URL
//     const [imageUrl, setImageUrl] = useState(customer?.metafields?.find(m => m?.key === 'profile_image')?.value || '');

//     // Function to update customer profile
//     const updateProfile = async (newName, newImageUrl) => {
//         try {
//             const response = await query(
//                 `
//                     mutation customerUpdate($input: CustomerInput!) {
//                         customerUpdate(input: $input) {
//                             customer {
//                                 firstName
//                                 metafields(first: 10) {
//                                     edges {
//                                         node {
//                                             key
//                                             value
//                                         }
//                                     }
//                                 }
//                             }
//                             userErrors {
//                                 field
//                                 message
//                             }
//                         }
//                     }
//                 `,
//                 {
//                     variables: {
//                         input: {
//                             firstName: newName,
//                             metafields: [{
//                                 key: 'profile_image',
//                                 value: newImageUrl,
//                                 namespace: 'custom',
//                                 type: 'single_line_text_field'
//                             }]
//                         },
//                     },
//                 }
//             );

//             if (response.data?.customerUpdate?.userErrors?.length === 0) {

//                 setImageUrl(newImageUrl);
//             } else {
//                 console.error('Update failed:', response.data?.customerUpdate?.userErrors);
//             }
//         } catch (error) {
//             console.error('Mutation error:', error);
//         }
//     };

//     return (
//         <BlockStack>
//             <Text>Edit Your Profile:</Text>
//             {/* Display Profile Image */}
//             {imageUrl && (
//                 <Image
//                     source={imageUrl}
//                     alt="Profile picture"
//                     border="base"
//                     borderRadius="base"
//                     maxWidth="200px"
//                     maxHeight="200px"
//                 />
//             )}



//             {/* Image URL Field */}
//             <TextField
//                 label="Profile Image URL"
//                 value={imageUrl}
//                 onChange={(value) => {
//                     setImageUrl(value);
//                     updateProfile(name, value);
//                 }}
//                 placeholder="https://example.com/image.jpg"
//             />
//             <Text size="small">
//                 Enter a URL to an image you'd like as your profile picture
//             </Text>
//         </BlockStack>
//     );
// }



// import {
//     useApi,
//     TextField,
//     Text,
//     Image,
//     BlockStack,
//     Button,
//     InlineStack,
//     reactExtension,
//     useAuthenticatedAccountCustomer
// } from '@shopify/ui-extensions-react/customer-account';
// import { useState, useEffect } from 'react';

// export default reactExtension('customer-account.profile.block.render', () => <ProfileEditor />);

// function ProfileEditor() {
//     const { query, authenticatedAccount } = useApi();
//     const { customer } = authenticatedAccount.customer;
//     const customerId = authenticatedAccount.customer.current.id;
//     // State management
//     const [imageUrl, setImageUrl] = useState('');
//     const [name, setName] = useState(''); // Removed customer?.firstName as initial value
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [isImageValid, setIsImageValid] = useState(true);

//     // Fetch customer name and load initial metafield values
//     useEffect(() => {
//         // Fetch customer name
//         const getCustomerNameQuery = {
//             query: `query {
//                 customer {
//                     firstName
//                 }
//             }`
//         };

//         fetch("shopify://customer-account/api/unstable/graphql.json",
//             {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(getCustomerNameQuery),
//             })
//             .then((response) => response.json())
//             .then(({data: { customer: {firstName}}}) => {
//                 setName(firstName);
//             })
//             .catch(console.error);

//         // Load initial metafield values
//         const profileImage = customer?.metafields?.find(m => m?.key === 'profile_image' && m?.namespace === 'custom')?.value;
//         setImageUrl(profileImage || '');
//     }, [customer]);

//     // Validate image URL
//     const validateImageUrl = (url) => {
//         return url.match(/\.(jpeg|jpg|png|gif)$/) != null;
//     };

//     // Handle image loading errors
//     const handleImageError = () => {
//         setIsImageValid(false);
//         setError('Invalid image URL or image failed to load');
//     };

//     // Update customer profile
//     const updateProfile = async () => {
//         if (!validateImageUrl(imageUrl)) {
//             setError('Please enter a valid image URL (jpg, png, or gif)');
//             return;
//         }

//         setIsLoading(true);
//         setError(null);

//         try {
//             // Step 1: Update customer firstName using customerUpdate
//             const customerUpdateResponse = await query(
//                 `
//                     mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
//                         customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
//                             customer {
//                                 firstName
//                             }
//                             userErrors {
//                                 field
//                                 message
//                             }
//                         }
//                     }
//                 `,
//                 {
//                     variables: {
//                         customerAccessToken: customer?.accessToken || '',
//                         customer: {
//                             firstName: name,
//                         },
//                     },
//                 }
//             );

//             const userErrors = customerUpdateResponse.data?.customerUpdate?.userErrors;
//             if (userErrors?.length > 0) {
//                 setError(userErrors[0].message);
//                 setIsLoading(false);
//                 return;
//             }

//             // Step 2: Update metafield using metafieldsSet mutation
//             const metafieldResponse = await query(
//                 `
//                     mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
//                         metafieldsSet(metafields: $metafields) {
//                             metafields {
//                                 key
//                                 value
//                                 namespace
//                             }
//                             userErrors {
//                                 field
//                                 message
//                             }
//                         }
//                     }
//                 `,
//                 {
//                     variables: {
//                         metafields: [
//                             {
//                                 key: 'profile_image',
//                                 value: imageUrl,
//                                 namespace: 'custom',
//                                 ownerId: customerId,
//                                 type: 'single_line_text_field',
//                             },
//                         ],
//                     },
//                 }
//             );

//             const metafieldErrors = metafieldResponse.data?.metafieldsSet?.userErrors;
//             if (metafieldErrors?.length > 0) {
//                 setError(metafieldErrors[0].message);
//             }
//         } catch (error) {
//             setError('Failed to update profile. Please try again.');
//             console.error('Mutation error:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <BlockStack spacing="loose">
//             <Text size="large">Edit Your Profile</Text>

//             {/* Display Profile Image */}
//             {imageUrl && (
//                 <Image
//                     source={imageUrl}
//                     alt="Profile picture"
//                     border="base"
//                     borderRadius="base"
//                     maxWidth="200px"
//                     maxHeight="200px"
//                     onError={handleImageError}
//                 />
//             )}
//             {!isImageValid && imageUrl && (
//                 <Text appearance="critical">Invalid image URL</Text>
//             )}

//             {/* Input Fields */}
//             <TextField
//                 label="Your Name"
//                 value={name}
//                 onChange={setName}
//                 placeholder="Enter your name"
//             />

//             <TextField
//                 label="Profile Image URL"
//                 value={imageUrl}
//                 onChange={(value) => {
//                     setImageUrl(value);
//                     setIsImageValid(true);
//                     setError(null);
//                 }}
//                 placeholder="https://example.com/image.jpg"
//                 disabled={isLoading}
//             />

//             {/* Instructions and Error Messages */}
//             <Text size="small" appearance="subdued">
//                 Enter a URL to an image (jpg, png, or gif) for your profile picture
//             </Text>
//             {error && (
//                 <Text appearance="critical">{error}</Text>
//             )}

//             {/* Save Button */}
//             <InlineStack>
//                 <Button
//                     onPress={updateProfile}
//                     loading={isLoading}
//                     disabled={!imageUrl || !name || !isImageValid}
//                 >
//                     Save Profile
//                 </Button>
//             </InlineStack>
//         </BlockStack>
//     );
// }

import {
    useApi,
    TextField,
    Text,
    Image,
    BlockStack,
    Button,
    InlineStack,
    reactExtension,
    DropZone
} from '@shopify/ui-extensions-react/customer-account';
import { useState, useEffect } from 'react';

export default reactExtension('customer-account.profile.block.render', () => <ProfileEditor />);

function ProfileEditor() {
    const { query } = useApi();
    const [imageUrl, setImageUrl] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isImageValid, setIsImageValid] = useState(true);

    // Fetch initial customer data
    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const response = await query(`
                    query {
                        customer {
                            id
                            firstName
                            metafields(first: 10, namespace: "custom") {
                                edges {
                                    node {
                                        key
                                        value
                                        namespace
                                    }
                                }
                            }
                        }
                    }
                `);

                const customerData = response.data?.customer;
                if (customerData) {
                    setName(customerData.firstName || '');
                    const profileImage = customerData.metafields?.edges?.find(
                        (edge) => edge.node.key === 'profile_image' && edge.node.namespace === 'custom'
                    )?.node.value;
                    setImageUrl(profileImage || '');
                }
            } catch (err) {
                setError('Failed to load customer data.');
                console.error('Fetch error:', err);
            }
        };

        fetchCustomerData();
    }, [query]);

    // Validate image URL
    const validateImageUrl = (url) => {
        return url.match(/\.(jpeg|jpg|png|gif)$/) != null;
    };

    // Handle image loading errors
    const handleImageError = () => {
        setIsImageValid(false);
        setError('Invalid image URL or image failed to load');
    };

    // Update customer profile
    const updateProfile = async () => {
        if (!name) {
            setError('Name is required.');
            return;
        }
        if (imageUrl && !validateImageUrl(imageUrl)) {
            setError('Please enter a valid image URL (jpg, png, or gif).');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Step 1: Update customer firstName
            const customerUpdateResponse = await query(
                `
                    mutation customerUpdate($input: CustomerInput!) {
                        customerUpdate(input: $input) {
                            customer {
                                id
                                firstName
                            }
                            userErrors {
                                field
                                message
                            }
                        }
                    }
                `,
                {
                    variables: {
                        input: {
                            firstName: name,
                        },
                    },
                }
            );

            const customerErrors = customerUpdateResponse.data?.customerUpdate?.userErrors;
            if (customerErrors?.length > 0) {
                setError(customerErrors[0].message);
                setIsLoading(false);
                return;
            }

            // Step 2: Update metafield for profile image
            if (imageUrl) {
                const customerId = customerUpdateResponse.data?.customerUpdate?.customer?.id;
                const metafieldResponse = await query(
                    `mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
                            metafieldsSet(metafields: $metafields) {
                                metafields {
                                    key
                                    value
                                    namespace
                                }
                                userErrors {
                                    field
                                    message
                                }
                            }
                        }
                    `,
                    {
                        variables: {
                            metafields: [
                                {
                                    key: 'profile_image',
                                    namespace: 'custom',
                                    value: imageUrl,
                                    ownerId: customerId,
                                    type: 'single_line_text_field',
                                },
                            ],
                        },
                    }
                );

                const metafieldErrors = metafieldResponse.data?.metafieldsSet?.userErrors;
                if (metafieldErrors?.length > 0) {
                    setError(metafieldErrors[0].message);
                    setIsLoading(false);
                    return;
                }
            }

            console.log('Profile updated successfully!');
        } catch (error) {
            setError('Failed to update profile. Please try again.');
            console.error('Mutation error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BlockStack spacing="loose">
            <Text size="large">Edit Your Profile</Text>

            {/* Display Profile Image */}
            {imageUrl && (
                <Image
                    source={imageUrl}
                    alt="Profile picture"
                    border="base"
                    borderRadius="base"
                    maxWidth="200px"
                    maxHeight="200px"
                    onError={handleImageError}
                />
            )}
            {!isImageValid && imageUrl && (
                <Text appearance="critical">Invalid image URL</Text>
            )}

            {/* Input Fields */}
            <TextField
                label="Your Name"
                value={name}
                onChange={setName}
                placeholder="Enter your name"
                disabled={isLoading}
            />
            <DropZone
                accepts="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
                multiple={false}
                disabled={isLoading}
            >
               
            </DropZone>
            <TextField
                label="Profile Image URL"
                value={imageUrl}
                onChange={(value) => {
                    setImageUrl(value);
                    setIsImageValid(true);
                    setError(null);
                }}
                placeholder="https://example.com/image.jpg"
                disabled={isLoading}
            />

            {/* Instructions and Error Messages */}
            <Text size="small" appearance="subdued">
                Enter a URL to an image (jpg, png, or gif) for your profile picture
            </Text>
            {error && <Text appearance="critical">{error}</Text>}

            {/* Save Button */}
            <InlineStack>
                <Button
                    onPress={updateProfile}
                    loading={isLoading}
                    disabled={!name || (imageUrl && !isImageValid) || isLoading}
                >
                    Save Profile
                </Button>
            </InlineStack>
        </BlockStack>
    );
}