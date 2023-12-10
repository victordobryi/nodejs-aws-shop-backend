import { ListObjectsCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { client as s3Client } from '../client.js';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs';

const getContents = async (bucketName: string) => {
  const listObjectsCommand = new ListObjectsCommand({ Bucket: bucketName });
  const listObjectsResult = await s3Client.send(listObjectsCommand);
  const objects = listObjectsResult.Contents ?? [];
  return objects;
};

export const listFilesInBucket = async (bucketName: string) => {
  const objects = await getContents(bucketName);

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
    const objects = await getContents(bucketName);

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
