const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { create } = require('ipfs-http-client');

// Экспортируем клиенты для тестирования
exports.ipfsClient = create({ url: 'http://localhost:5001' });
exports.s3Client = new S3Client({ region: 'us-east-1' });

exports.uploadMetadata = async (metadata) => {
  try {
    const { cid } = await exports.ipfsClient.add(JSON.stringify(metadata));
    return { cid: cid.toString() };
  } catch (error) {
    console.log("Using S3 fallback");
    const command = new PutObjectCommand({
      Bucket: 'educhain-fallback',
      Key: `metadata/${Date.now()}.json`,
      Body: JSON.stringify(metadata)
    });
    await exports.s3Client.send(command);
    return { fallbackUrl: `s3://educhain-fallback/${command.input.Key}` };
  }
};