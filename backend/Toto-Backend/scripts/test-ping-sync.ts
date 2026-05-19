import axios from 'axios';

const runTest = async () => {
    try {
        console.log('🚀 Starting Ping Sync Test...');
        
        // This should trigger the sync
        const response = await axios.get('http://localhost:5001/shopify/ping');
        
        console.log('✅ Response:', response.status);
        console.log('📦 Products returned:', response.data.data.products.length);
        console.log('ℹ️ Check backend logs for "Successfully synced products batch"');
    } catch (error: any) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    }
};

runTest();
