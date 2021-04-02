import { request } from '@/utils/http';
import msg from '@/utils/msg';
import { isEmpty } from '@/utils/tools';
import router from 'umi/router';

const emptyUserList = {
  userList: [],
  count: 0,
};

const emptyRoleList = {
  roleList: [],
  count: 0,
};

const emptyMEnuList = {
  menulist: [],
  defaultMenuId: [],
};

const emptyList = [];
const searchKey = {
  page: 1,
  pageCount: 10,
  user_name: '',
  user_phone: '',
  user_login_id: '',
  user_status: '',
};
export default {
  namespace: 'manager',
  state: {
    MANAGER_USER_LIST: emptyUserList,
    MANAGER_Role_LIST: emptyList,
    MANAGER_CATEORY_LIST: emptyList,
    FIELDS: searchKey,
    USER_INFO: {},
    USER_ID: '',
    MANAGER_USER_DETAIL_INFO: {},
    MANAGER_ROLE_LIST_Table: {},
    ROLEFILDS: emptyRoleList,
    MANAGER_MENU_LIST: emptyMEnuList,
  },
  effects: {
    * fetchManagerUserList({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'manager_getUserList',
        params: payload,
      });
      if (res.code === 0) {
        yield put({
          type: 'managerRememberSearchData',
          payload: payload,
        });
        yield put({
          type: 'updateManagerUserList',
          payload: res.data,
        });
      } else {
        msg(res);
        yield put({
          type: 'updateManagerUserList',
        });
      }
    },
    * managerGetUserDetail({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'manager_getUserDetail',
        params: payload,
      });
      if (res.code === 0) {
        ;yield put({
          type: 'UpdateManagerUserInfo',
          payload: res.data,
        });
        yield put({
          type: 'managerUserId',
          payload: payload,
        });
      } else {
        msg(res);
        yield put({
          type: 'UpdateManagerUserInfo',
        });
      }
    },
    * managerSelectRole({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'manager_selectRole',
        params: payload,
      });
      if (res.code === 0) {
        ;yield put({
          type: 'updateManagerRoleList',
          payload: res.data,
        });
      } else {
        msg(res);
        yield put({
          type: 'updateManagerRoleList',
        });
      }
    },

    * managerallBrandCategory({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'manager_allBrandCategory',
        params: payload,
      });
      if (res.code === 0) {
        ;yield put({
          type: 'updateManagerCategoryList',
          payload: res.data,
        });
      } else {
        msg(res);
        yield put({
          type: 'updateManagerCategoryList',
        });
      }
    },

    * managerInsertUser({ data, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'manager_insertUser',
        data: data,
      });
      if (res.code === 0) {
        msg('创建成功!');
        router.goBack();
      } else {
        msg(res);
      }
    },

    * managerUpdateUserInfo({ payload, callback }, { call, put, select }) {
      const res = yield call(request, {
        fnName: 'manager_updateUserInfo',
        params: payload,
      });
      if (res.code === 0) {
        msg('操作成功');
        router.goBack();
      } else {
        msg(res);
      }
    },
    * managerUpdateuserRole({ payload, callback }, { call, put, select }) {
      const { USER_ID } = yield select(state => state.manager);
      const res = yield call(request, {
        fnName: 'manager_updateuserRole',
        params: payload,
      });
      if (res.code === 0) {
        msg('操作成功');
        yield put({
          type: 'managerSelectRole',
          payload: USER_ID,
        });
      } else {
        msg(res);
      }
    },

    * managerDeleteUser({ payload, callback }, { call, put, select }) {
      const { FIELDS, MANAGER_USER_LIST } = yield select(state => state.manager);
      const { userList } = MANAGER_USER_LIST;
      const res = yield call(request, {
        fnName: 'manager_deleteUser',
        params: payload,
      });
      if (res.code === 0) {
        msg('操作成功');
        yield put({
          type: 'fetchManagerUserList',
          payload: (userList.length === 1 && FIELDS.page !== 1) ? {...FIELDS, page: FIELDS.page - 1} : FIELDS,
        });
      } else {
        msg(res);
      }
    },

    * managerUpdateuserCategory({ payload, callback }, { call, put, select }) {
      const { USER_ID } = yield select(state => state.manager);
      const res = yield call(request, {
        fnName: 'manager_updateuserCategory',
        params: payload,
      });
      if (res.code === 0) {
        msg('操作成功');
        yield put({
          type: 'managerallBrandCategory',
          payload: USER_ID,
        });
      } else {
        msg(res);
      }
    },

    * managerSelectRoleList({ payload, callback }, { call, put }) {
      const res = yield call(request, {
        fnName: 'manager_selectRoleList',
        params: payload,
      });
      if (res.code === 0) {
        yield put({
          type: 'updateManagerRoleListPage',
          payload: res.data,
        });
        yield put({
          type: 'managerRememberRoleSearchData',
          payload: payload,
        });
      } else {
        msg(res);
        yield put({
          type: 'updateManagerRoleListPage',
        });
      }
    },

    * managerDeleteRole({ payload, callback }, { call, put, select }) {
      const { ROLEFILDS, MANAGER_ROLE_LIST_Table } = yield select(state => state.manager);
      const { roleList } = MANAGER_ROLE_LIST_Table;
      const res = yield call(request, {
        fnName: 'manager_deleteRole',
        params: payload,
      });
      if (res.code === 0) {
        msg('操作成功');
        yield put({
          type: 'managerSelectRoleList',
          payload: (roleList.length === 1 && ROLEFILDS.page !== 1) ? {...ROLEFILDS, page: ROLEFILDS.page - 1} : ROLEFILDS,
        });
      } else {
        msg(res);
      }
    },

    * managerGetmenuAllList({ payload, callback }, { call, put, select }) {
      const { ROLEFILDS } = yield select(state => state.manager);
      const res = yield call(request, {
        fnName: 'manager_getmenuAllList',
        params: payload,
      });
      if (res.code === 0) {
        ;yield put({
          type: 'updateManagerGetmenuAllList',
          payload: res.data,
        });
      } else {
        msg(res);
      }
      callback(res);
    },

    * managerInsertRole({ data, callback }, { call, put, select }) {
      const { ROLEFILDS } = yield select(state => state.manager);
      const res = yield call(request, {
        fnName: 'manager_insertRole',
        data: data,
      });
      if (res.code === 0) {
        if (data.role_id){
          msg('修改成功');
          router.goBack();
        }else {
          msg('创建成功');
          router.goBack();
        }

      } else {
        msg(res);
      }
    },
  },
  reducers: {
    updateManagerUserList(state, { payload }) {
      return { ...state, MANAGER_USER_LIST: payload || emptyUserList };
    },
    updateManagerRoleList(state, { payload }) {
      return { ...state, MANAGER_Role_LIST: payload || emptyList };
    },
    UpdateManagerUserInfo(state, { payload }) {
      return { ...state, MANAGER_USER_DETAIL_INFO: payload || emptyList };
    },
    updateManagerCategoryList(state, { payload }) {
      return { ...state, MANAGER_CATEORY_LIST: payload || emptyList };
    },
    updateManagerRoleListPage(state, { payload }) {
      return { ...state, MANAGER_ROLE_LIST_Table: payload || emptyList };
    },
    updateManagerGetmenuAllList(state, { payload }) {
      return { ...state, MANAGER_MENU_LIST: payload || emptyMEnuList };
    },
    managerRememberRoleSearchData(state, { payload }) {
      return payload ? { ...state, ROLEFILDS: payload } : { ...state, ROLEFILDS: emptyRoleList };
    },
    managerRememberSearchData(state, { payload }) {
      return payload ? { ...state, FIELDS: payload } : { ...state, FIELDS: searchKey };
    },
    managerClearState(state, { payload }) {
      return {
        ...state,
        MANAGER_Role_LIST: emptyList,
        MANAGER_CATEORY_LIST: emptyList,
        MANAGER_USER_DETAIL_INFO: {},
      };
    },
    managerUserId(state, { payload }) {
      return payload ? { ...state, USER_ID: payload } : { ...state, USER_ID: '' };
    },

  },
  subscriptions: {},
};
