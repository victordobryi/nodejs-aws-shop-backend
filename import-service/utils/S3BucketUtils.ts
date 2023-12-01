import {
  CreateBucketCommand,
  PutBucketPolicyCommand,
  ListObjectsCommand,
  DeleteBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { client as s3Client } from '../client.js';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';

export const createBucket = (bucketName: string) => {
  const createBucketCommand = new CreateBucketCommand({
    Bucket: bucketName,
  });

  return s3Client.send(createBucketCommand);
};

export const deleteBucket = (bucketName: string) => {
  const deleteBucketCommand = new DeleteBucketCommand({
    Bucket: bucketName,
  });

  return s3Client.send(deleteBucketCommand);
};

export const listFilesInBucket = async (bucketName: string) => {
  const listObjectsCommand = new ListObjectsCommand({ Bucket: bucketName });
  const listObjectsResult = await s3Client.send(listObjectsCommand);
  const objects = listObjectsResult.Contents ?? [];
  const contentsList = objects.map((c) => ` • ${c.Key}`).join('\n');
  console.log("\nHere's a list of files in the bucket:");
  console.log(contentsList + '\n');
};

export const downloadFilesFromBucket = async (props: { bucketName: string; path: string }) => {
  const { bucketName, path } = props;
  console.log(`Downloading files from ${bucketName}\n`);
  if (!path) return;
  if (!existsSync(path)) mkdirSync(path);

  try {
    const listObjectsCommand = new ListObjectsCommand({ Bucket: bucketName });
    const listObjectsResult = await s3Client.send(listObjectsCommand);
    const objects = listObjectsResult.Contents ?? [];

    for (let content of objects) {
      const obj = await s3Client.send(
        new GetObjectCommand({ Bucket: bucketName, Key: content.Key })
      );
      if (obj.Body) writeFileSync(`${path}/${content.Key}`, await obj.Body.transformToByteArray());
    }
    console.log('download finished');
  } catch (error) {
    console.log(error);
  }
};

export const uploadFilesToBucket = async (props: { bucketName: string; folderPath: string }) => {
  const { bucketName, folderPath } = props;
  console.log(`Uploading files from ${folderPath}\n`);
  try {
    const keys = readdirSync(folderPath);
    const files = keys.map((key) => {
      const filePath = `${folderPath}/${key}`;
      const fileContent = readFileSync(filePath);
      return {
        Key: key,
        Body: fileContent,
      };
    });

    for (let file of files) {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Body: file.Body,
          Key: file.Key,
        })
      );
      console.log(`${file.Key} uploaded successfully.`);
    }
    console.log('upload finished');
  } catch (error) {
    console.log(error);
  }
};

export const putBucketPolicyAllowPuts = (props: { bucketName: string; sid: string }) => {
  const { bucketName, sid } = props;
  console.log(`Putting bucket policy to allow puts to ${bucketName}`);

  const putBucketPolicyCommand = new PutBucketPolicyCommand({
    Bucket: bucketName,
    Policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: sid,
          Effect: 'Allow',
          Principal: {
            Service: 'ses.amazonaws.com',
          },
          Action: 's3:PutObject',
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    }),
  });

  return s3Client.send(putBucketPolicyCommand);
};
