import {
  DynamicModule,
  Module,
  Provider
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TENRA_ADAPTER_OPTIONS } from './nestjs-adapter.constants';
import { TenraNestInterceptor } from './nestjs-adapter.interceptor';
import type { NestjsTenraAdapterOptions } from './nestjs-adapter.types';

@Module({})
export class TenraNestAdapterModule {
  static forRoot(options: NestjsTenraAdapterOptions = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: TENRA_ADAPTER_OPTIONS,
      useValue: options
    };

    const interceptorProvider: Provider = {
      provide: APP_INTERCEPTOR,
      useClass: TenraNestInterceptor
    };

    return {
      module: TenraNestAdapterModule,
      providers: [
        optionsProvider,
        interceptorProvider
      ],
      exports: [optionsProvider]
    };
  }
};