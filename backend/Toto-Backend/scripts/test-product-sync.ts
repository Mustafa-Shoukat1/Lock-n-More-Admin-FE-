
import axios from 'axios';

const runTest = async () => {
    try {
        console.log('🚀 Starting Product Sync Test...');

        const products = [
            {
                id: 123456789,
                title: 'Test Product with Long Description',
                vendor: 'Test Vendor',
                product_type: 'Test Type',
                handle: 'test-product',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                published_at: new Date().toISOString(),
                tags: 'tag1, tag2',
                variants: [
                    { inventory_quantity: 10 },
                    { inventory_quantity: 5 }
                ],
                // > 500 chars to test chunking
                body_html: 'A'.repeat(1200),
                images: [
                    { id: 111, src: 'http://example.com/img1.jpg', position: 1, width: 100, height: 100, alt: 'img1' },
                    { id: 222, src: 'http://example.com/img2.jpg', position: 2, width: 200, height: 200, alt: 'img2' }
                ]
            }
        ];

        // Testing the endpoint /shopify/products (mounted in app.ts as /shopify)
        const response = await axios.post('http://localhost:5001/shopify/products', products);

        console.log('✅ Response:', response.status, response.data);
    } catch (error: any) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    }
};

runTest();
