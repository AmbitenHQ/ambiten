import { APP_INTERCEPTOR } from '@nestjs/core';
import { TENRA_ADAPTER_OPTIONS } from '../src/nestjs-adapter.constants';
import { TenraNestInterceptor } from '../src/nestjs-adapter.interceptor';
import { TenraNestAdapterModule } from '../src/nestjs-adapter.module';

describe('TenraNestAdapterModule', () => {
  it('should create a dynamic module with options and global interceptor providers', () => {
    const options = {
      tenancy: {
        header: 'x-tenant-id'
      },
      requestIdHeader: 'x-request-id'
    };

    const module = TenraNestAdapterModule.forRoot(options);

    expect(module.module).toBe(TenraNestAdapterModule);

    expect(module.providers).toEqual(
      expect.arrayContaining([
        {
          provide: TENRA_ADAPTER_OPTIONS,
          useValue: options
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: TenraNestInterceptor
        }
      ])
    );

    expect(module.exports).toEqual(
      expect.arrayContaining([
        {
          provide: TENRA_ADAPTER_OPTIONS,
          useValue: options
        }
      ])
    );
  });

  it('should use empty options by default', () => {
    const module = TenraNestAdapterModule.forRoot();

    expect(module.providers).toEqual(
      expect.arrayContaining([
        {
          provide: TENRA_ADAPTER_OPTIONS,
          useValue: {}
        }
      ])
    );
  });
});