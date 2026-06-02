import { APP_INTERCEPTOR } from '@nestjs/core';
import { AMBITEN_ADAPTER_OPTIONS } from '../src/nestjs-adapter.constants';
import { AmbitenNestInterceptor } from '../src/nestjs-adapter.interceptor';
import { AmbitenNestAdapterModule } from '../src/nestjs-adapter.module';

describe('AmbitenNestAdapterModule', () => {
  it('should create a dynamic module with options and global interceptor providers', () => {
    const options = {
      tenancy: {
        header: 'x-tenant-id'
      },
      requestIdHeader: 'x-request-id'
    };

    const module = AmbitenNestAdapterModule.forRoot(options);

    expect(module.module).toBe(AmbitenNestAdapterModule);

    expect(module.providers).toEqual(
      expect.arrayContaining([
        {
          provide: AMBITEN_ADAPTER_OPTIONS,
          useValue: options
        },
        {
          provide: APP_INTERCEPTOR,
          useClass: AmbitenNestInterceptor
        }
      ])
    );

    expect(module.exports).toEqual(
      expect.arrayContaining([
        {
          provide: AMBITEN_ADAPTER_OPTIONS,
          useValue: options
        }
      ])
    );
  });

  it('should use empty options by default', () => {
    const module = AmbitenNestAdapterModule.forRoot();

    expect(module.providers).toEqual(
      expect.arrayContaining([
        {
          provide: AMBITEN_ADAPTER_OPTIONS,
          useValue: {}
        }
      ])
    );
  });
});