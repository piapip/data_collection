module.exports = {
    mongoURI:process.env.MONGO_URI,
    uploadAPI:process.env.uploadAPI,
    JWT_SECRET_KEY:process.env.JWT_SECRET_KEY,
    transcript_api:process.env.transcript_api,
    transcript_api_key:process.env.transcript_api_key,
    // vvvvvvv doesn't need for now.
    awsAccessKeyId:process.env.awsAccessKeyId,
    awsSecretAccessKey:process.env.awsSecretAccessKey,
    awsSessionToken:process.env.awsSessionToken,
    awsBucketName:process.env.awsBucketName,
    awsRegion:process.env.awsRegion,
}