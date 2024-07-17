import crypto from 'crypto';

// Tạo secret key ngẫu nhiên
const generateRandomSecretKey = () => {
    return crypto.randomBytes(64).toString('hex');
};

// Sử dụng hàm generateRandomSecretKey để lấy secret key
const secretKey = generateRandomSecretKey();

console.log('Secret key:', secretKey);