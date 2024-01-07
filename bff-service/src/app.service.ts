import {
  BadGatewayException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import axios, { AxiosRequestConfig } from 'axios';
import { parse } from 'querystring';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async getServiceResponse(service: string, request: Request) {
    const { method, headers, body, originalUrl } = request;

    const serviceUrl = process.env[service];

    if (!serviceUrl) {
      throw new BadGatewayException('Cannot process request');
    }

    const isCacheRequest = method === 'GET' && originalUrl === '/product';

    if (isCacheRequest) {
      const cache = (await this.cacheManager.get(originalUrl)) as any;

      if (cache) {
        return cache;
      }
    }

    const queryParamsString = originalUrl.split('?')[1];
    const reqParams = parse(queryParamsString) as Record<string, string>;

    try {
      const serviceRequest: AxiosRequestConfig = {
        method,
        url: `${serviceUrl}`,
        headers: headers.authorization
          ? { Authorization: headers.authorization }
          : {},
        params: reqParams,
        data: Object.keys(body).length ? body : null,
      };

      const response = await axios.request(serviceRequest);

      const result = {
        headers: response.headers,
        data: response.data,
        status: response.status,
      };

      if (isCacheRequest) {
        await this.cacheManager.set(originalUrl, result);
      }

      return result;
    } catch (e) {
      if (e.response) {
        const result = {
          headers: e.response.headers,
          data: e.response.data,
          status: e.response.status,
        };

        return result;
      }

      throw new InternalServerErrorException(e.message);
    }
  }
}
