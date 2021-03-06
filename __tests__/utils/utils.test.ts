import { TextDecoder, TextEncoder } from 'util';
import utils from '../../src/utils/utils';
import { options } from '../test-helper';
import { CODE_IDS } from '../../src/utils/constant';
import app from '../../src/app';
import { CodeTypeEnum } from '../../src/types/smart-contract-enum';

describe('test some utility functions', () => {
  app.init(options.canUrl, options.fetch, TextEncoder, TextDecoder);

  it('should get normal code id', async () => {
    const get_table_rows = jest.spyOn(app.rpc, 'get_table_rows');
    get_table_rows.mockResolvedValue({
      // @ts-ignore
      rows: [
        {
          code_id: 1,
          code_name: 'po.create',
          contract_name: process.env.app__can_governance_account,
          code_actions: ['createpos'],
          code_exec_type: 1,
          amendment_exec_type: 0,
          code_type: { type: 0, refer_id: 0 },
        },
      ],
      more: false,
    });

    const code = await utils.findCode(options.code, 'community242', CODE_IDS.CREATE_POSITION, CodeTypeEnum.NORMAL);
    expect(get_table_rows).toBeCalledWith({
      code: process.env.app__can_governance_account,
      scope: 'community242',
      table: 'v1.code',
      lower_bound: 'po.create',
      upper_bound: 'po.create',
      index_position: 2,
      key_type: 'i64',
    });
    expect(get_table_rows).toBeCalledTimes(1);
    expect(code.code_id).toEqual(1);
    expect(code.code_name).toEqual(CODE_IDS.CREATE_POSITION);
  });

  it('should get position code id', async () => {
    const get_table_rows = jest.spyOn(app.rpc, 'get_table_rows');
    get_table_rows.mockResolvedValue({
      // @ts-ignore
      rows: [
        {
          code_id: 11,
          code_name: 'po.config',
          contract_name: process.env.app__can_governance_account,
          code_actions: ['configpos'],
          code_exec_type: 1,
          amendment_exec_type: 0,
          code_type: { type: 1, refer_id: 99 },
        },
      ],
      more: false,
    });

    const code = await utils.findCode(
      options.code,
      'community242',
      CODE_IDS.CONFIGURE_POSITION,
      CodeTypeEnum.POSITION_CONFIG,
      99,
    );
    expect(get_table_rows).toBeCalledWith({
      code: process.env.app__can_governance_account,
      scope: 'community242',
      table: 'v1.code',
      lower_bound: utils.buildReferenceId(99, CodeTypeEnum.POSITION_CONFIG),
      upper_bound: utils.buildReferenceId(99, CodeTypeEnum.POSITION_CONFIG),
      index_position: 3,
      key_type: 'i128',
    });
    expect(get_table_rows).toBeCalledTimes(1);
    expect(code.code_id).toEqual(11);
    expect(code.code_name).toEqual(CODE_IDS.CONFIGURE_POSITION);
  });

  it('should build reference id', async () => {
    const referenceId = 111;
    const codeType = CodeTypeEnum.BADGE_CONFIG;
    const expectedReferenceId = '2047588592181760229380';
    const res = utils.buildReferenceId(referenceId, codeType);

    expect(res).toBe(expectedReferenceId);
  });

  it('should make a random number', async () => {
    for (let i = 0; i < 1000; i++) {
      const n = utils.randomNumberInRange(8, 12);
      expect(n).toBeGreaterThanOrEqual(8);
      expect(n).toBeLessThanOrEqual(12);
    }
    for (let i = 0; i < 1000; i++) {
      const n = utils.randomNumberInRange(8, 9);
      expect(n).toBeGreaterThanOrEqual(8);
      expect(n).toBeLessThanOrEqual(9);
    }
    for (let i = 0; i < 1000; i++) {
      const n = utils.randomNumberInRange(5, 10);
      expect(n).toBeGreaterThanOrEqual(5);
      expect(n).toBeLessThanOrEqual(10);
    }
  });

  it('should make a random eos name', async () => {
    const names = new Array(10000).fill('').map(() => {
      const name = utils.randomEosName();
      expect(name).toMatch(/^[1-5.a-z]+$/);
      expect(name.length).toBeGreaterThanOrEqual(8);
      expect(name.length).toBeLessThanOrEqual(12);
      return name;
    });

    // check unique
    expect(names.length).toEqual(new Set(names).size);
  });
});
