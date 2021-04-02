import { request } from '@/utils/http';
import msg from '@/utils/msg';

export default {

    namespace: 'vin_clean',

    state: {

    },

    effects: {
        // 清除vin缓存
        *cleanVinLevelId({ payload }, { call, put }) {
            const res = yield call(request, { 
                fnName: 'vin_levelid_delete', 
                data: {
                    vin_code: payload.vin_code
                }
            });
            if(res.code === 0) {
                payload.cb && payload.cb();
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