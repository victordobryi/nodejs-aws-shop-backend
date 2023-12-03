import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { client as s3Client } from '../client.js';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const getObject = async (props: { bucketName: string; key: string }) => {
  const { bucketName, key } = props;

  console.log(`get object ${bucketName}:${key}`);

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);
    if (response.Body) {
      const str = await response.Body.transformToString();
      console.log(`result: ${str}`);
    }
  } catch (err) {
    console.error(err);
  }
};

export const copyObject = async (props: {
  destinationBucket: string;
  sourceBucket: string;
  sourceKey: string;
  destinationKey: string;
}) => {
  const { destinationBucket, sourceBucket, sourceKey, destinationKey } = props;

  console.log(`copy from ${sourceBucket}:${sourceKey} to ${destinationBucket}:${destinationKey}`);

  try {
    const command = new CopyObjectCommand({
      Bucket: destinationBucket,
      CopySource: `${sourceBucket}/${sourceKey}`,
      Key: destinationKey,
    });
    await s3Client.send(command);
    console.log('copy finished');
  } catch (err) {
    console.error(err);
  }
};

export const deleteObject = async (props: { bucketName: string; key: string }) => {
  const { bucketName, key } = props;

  console.log(`delete object ${bucketName}:${key}`);

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await s3Client.send(command);
    console.log('delete finished');
  } catch (err) {
    console.error(err);
  }
};

export const deleteObjects = async (props: { bucketName: string; keys: string[] }) => {
  const { bucketName, keys } = props;
  console.log(`delete objects from ${bucketName}`);

  try {
    const objectIdentifiers = keys.map((key) => ({ Key: key }));
    const deleteObjectsCommand = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: { Objects: objectIdentifiers },
    });
    await s3Client.send(deleteObjectsCommand);
    console.log('delete finished');
  } catch (error) {
    console.log(error);
  }
};

export const deleteAllObjectsFromBucket = async (bucketName: string) => {
  console.log(`delete all objects from ${bucketName}`);

  try {
    const listObjectsCommand = new ListObjectsCommand({ Bucket: bucketName });
    const listObjectsResult = await s3Client.send(listObjectsCommand);
    const objects = listObjectsResult.Contents ?? [];
    const objectIdentifiers = objects.map((o) => ({ Key: o.Key }));
    const deleteObjectsCommand = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: { Objects: objectIdentifiers },
    });

    await s3Client.send(deleteObjectsCommand);
    console.log('delete finished');
  } catch (error) {
    console.log(error);
  }
};

export const generateSignedUrl = async (props: {
  bucketName: string;
  key: string;
}): Promise<string> => {
  const { key, bucketName } = props;

  const putCommand = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  const signedUrl = await getSignedUrl(s3Client, putCommand, {
    expiresIn: 60,
  });
  return signedUrl;
};
