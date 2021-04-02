import { request } from '@/utils/http';
import msg from '@/utils/msg';

export default {
  namespace: 'dataimport',

  state: {

  },

  effects: {
    *fetchImport({ payload }, { call, put }) {
      let fd = new FormData();
      fd.append('file', payload.file);
      fd.append('version', payload.version);
      fd.append('origin', payload.origin);
      const res = yield call(request, { fnName: 'carmodel_import', data: fd });
      payload.cb && payload.cb(res.code);
    },
    
    *fetchVinJzRecords({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'vin_jz_records',
        params: payload
      });
      if (res.code === 0) {
        const { tHeader, tbody } = res.data;
        callback(tHeader, tbody);
      } else {
        msg(res);
      }

    }


  },
  reducers: {

  },

  subscriptions: {

  }
};
