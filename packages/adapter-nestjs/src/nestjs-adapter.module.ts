import {
  DynamicModule,
  Module,
  Provider
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AMBITEN_ADAPTER_OPTIONS } from './nestjs-adapter.constants';
import { AmbitenNestInterceptor } from './nestjs-adapter.interceptor';
import type { NestjsAmbitenAdapterOptions } from './nestjs-adapter.types';

@Module({})
export class AmbitenNestAdapterModule {
  static forRoot(options: NestjsAmbitenAdapterOptions = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: AMBITEN_ADAPTER_OPTIONS,
      useValue: options
    };

    const interceptorProvider: Provider = {
      provide: APP_INTERCEPTOR,
      useClass: AmbitenNestInterceptor
    };

    return {
      module: AmbitenNestAdapterModule,
      providers: [
        optionsProvider,
        interceptorProvider
      ],
      exports: [optionsProvider]
    };
  }
};