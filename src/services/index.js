import { post, get } from 'utils/http';
import * as api from './apiUrl';

/******************
 * 其他
 ******************/

// 登录 {data:{ account, password }}
export const login = ({ data }) =>
  post(api.login, { data });

//退出登录
export const loginOut = () => post(api.loginOut, {});

// 导入车型数据
export const carmodel_import = ({ data }) => {
  return post(api.carmodel_import, { data });
};

/******************
 * 标准车型
 ******************/

// 获取品牌主机厂车型列表
// 目前只会传进来一个值【有传进来的地方：1、OE管理 - 适配车型列表；2、OE管理 - 添加适配车型】；3、大厂码 - 添加适配车型；4、行业码 - 添加适配车型
export const carmodel_brand_fac_mod_list = ({ params }) => {
  return get(api.carmodel_brand_fac_mod_list, { params });
};

export const carmodel_brand_fac_mod_list_approved = ({ params }) => {
  return get(api.carmodel_brand_fac_mod_list_approved, { params });
};

// 标准车型 - 获取车型属性列表
export const carmodel_pro_list = ({ params }) => {
  return get(api.carmodel_pro_list, { params });
};

// 标准车型 - 获取标准车型详情
export const carmodel_base_info = ({ params }) => {
  return get(api.carmodel_base_info + params.cm_id);
};

// 标准车型 - 获取源车型列表
export const carmodel_origin_list = ({ params }) => {
  return get(api.carmodel_origin_list + params.cm_id);
};

// 标准车型 - 获取源车型详情
export const carmodel_origin_info = ({ params }) => {
  return get(api.carmodel_origin_info + params.cm_origin_id, { params: { cm_origin: params.cm_origin } });
};

// 标准车型 - 获取batch执行状态
export const carmodel_batch_status = ({ params }) => {
  return get(api.carmodel_batch_status, { params: { job_record_id: params.job_record_id } });
};
export const carmodel_batch_approve_status = ({ params }) => {
  return get(api.carmodel_batch_approve_status, { params: { job_record_id: params.job_record_id } });
};

// 标准车型 - 获取batch执行历史
export const carmodel_batch_his_list = ({ params }) => {
  return get(api.carmodel_batch_his_list, { params: { perpage: params.perpage, page: params.page } });
};

export const carmodel_base_list = ({ params }) => {
  return get(api.carmodel_base_list, { params });
};

// 标准车型 - 车型详情更新
export const carmodel_base_info_update = ({ data }) => {
  return post(api.carmodel_base_info_update, { data });
};

// 标准车型 - 车型详情添加
export const carmodel_base_info_add = ({ data }) => {
  return post(api.carmodel_base_info_add, { data });
};

// 标准车型 - 删除标准车型
export const carmodel_base_info_delete = ({ data }) => {
  return post(api.carmodel_base_info_delete, { data });
};

// 标准车型 - 审核通过
export const carmodel_base_origin_approve = ({ data }) => {
  return post(api.carmodel_base_origin_approve, { data });
};

// 标准车型 - 解除标准车型和源车型关系
export const carmodel_base_origin_mapping_delete = ({ data }) => {
  return post(api.carmodel_base_origin_mapping_delete, { data });
};

// 标准车型 - 车型批量任务
export const carmodel_batch_format = ({ data }) => {
  return post(api.carmodel_batch_format, { data });
};
export const carmodel_batch_approve_format = ({ data }) => {
  return post(api.carmodel_batch_approve_format, { data });
};

// 标准车型 - 车型标准化后审核通过
export const carmodel_fromat_approve = ({ data }) => {
  return post(api.carmodel_fromat_approve, { data });
};

// 标准车型 - 删除标准车型源车型
export const carmodel_origin_del = ({ data }) => {
  return post(api.carmodel_origin_del, { data });
};

// 标准车型 - 审核通过检查
export const carmodel_approve_check = ({ data }) => {
  return post(api.carmodel_approve_check, { data });
};

// 标准车型 - 获取同品牌同主机厂下的车系
export const carmodel_car = ({ params }) => {
  return get(api.carmodel_car, { params });
};

// 标准车型 - 拆分
export const carmodel_split = ({ data }) => {
  return post(api.carmodel_split, { data });
};

// 标准车型 - 复制clone
export const carmodel_clone = ({ data }) => {
  return post(api.carmodel_clone, { data });
};

// 标准车型 - 删除标准车型机油等级
export const carmodel_engineoil_level_del = ({ data }) => {
  return post(api.carmodel_engineoil_level_del, { data });
};

// 标准车型 - 更新标准车型机油等级
export const carmodel_engineoil_level_update = ({ data }) => {
  return post(api.carmodel_engineoil_level_update, { data });
};

// 标准车型 - 添加标准车型机油等级
export const carmodel_engineoil_level_add = ({ data }) => {
  return post(api.carmodel_engineoil_level_add, { data });
};

// 标准车型 - 获取机油等级数据
export const carmodel_engineoil_level = ({ params }) => {
  return get(api.carmodel_engineoil_level, { params });
};

// 标准车型 - 删除标准车型机油粘度
export const carmodel_engineoil_sae_del = ({ data }) => {
  return post(api.carmodel_engineoil_sae_del, { data });
};

// 标准车型 - 更新标准车型机油粘度
export const carmodel_engineoil_sae_update = ({ data }) => {
  return post(api.carmodel_engineoil_sae_update, { data });
};

// 标准车型 - 添加标准车型机油粘度
export const carmodel_engineoil_sae_add = ({ data }) => {
  return post(api.carmodel_engineoil_sae_add, { data });
};

// 标准车型 - 获取机油粘度数据
export const carmodel_engineoil_sae = ({ params }) => {
  return get(api.carmodel_engineoil_sae, { params });
};
// 标准车型 - 查看修改记录
export const carmodel_info_update_history = ({ params }) => {
  return get(api.carmodel_info_update_history+ params.cm_id);
};
// 车型品牌 - 车型品牌列表
export const carmodel_brands = ({ params }) => {
  return get(api.carmodel_brands, { params });
};

// 车型品牌 - 获取车型品牌设置
export const carmodel_brand_info = ({ params }) => {
  return get(api.carmodel_brand_info, { params });
};

// 车型品牌 - 设置车型品牌
export const carmodel_brand_update = ({ data }) => {
  return post(api.carmodel_brand_update, { data });
};

// 车型品牌 - 删除车型品牌
export const carmodel_brand_del = ({ data }) => {
  return post(api.carmodel_brand_del, { data });
};

// 车型品牌 - 车型品牌图片上传
export const carmodel_brand_image_upload = ({ data }) => {
  return post(api.carmodel_brand_image_upload, { data });
};

// 车型品牌 - 修改主机厂排列顺序
export const carmodel_factory = ({ data }) => {
  return post(api.carmodel_factory, { data });
};

/******************
 * 零件树
 ******************/

// 零件树 - 获取品类树
export const category_tree = ({ params }) => {
  return get(api.category_tree, { params: { root: params } });
};

export const category_tree_all = ({ params }) => {
  return get(api.category_tree_all, { params });
};

// 零件树 - 获取品类信息
export const category_info = ({ params }) => {
  return get(api.category_info + params.category_id);
};

// 零件树 - 品类名称校验
export const category_name_valid = ({ params }) => {
  return get(api.category_name_valid, { params: { category_name: params.category_name, category_id: params.category_id } });
};

// 零件树 - 创建品类
export const category_create = ({ data }) => {
  return post(api.category_create, { data });
};

// 零件树 - 更新品类
export const category_update = ({ data }) => {
  return post(api.category_update, { data });
};

// 零件树 - 删除品类
export const category_delete = ({ data }) => {
  return post(api.category_delete, { data });
};

// 零件树 - 树节点拖动
export const category_drag = ({ data }) => {
  return post(api.category_drag, { data });
};

// 零件树 - 图片上传
export const category_image_upload = ({ data }) => {
  return post(api.category_image_upload, { data });
};

/******************
 * 品牌件
 ******************/


// 根据品类id获取品类&产品
export const brand_category = ({ params }) => {
  return get(api.brand_category, { params });
};

// 品牌件 - 获取品牌件品类列表
export const brand_category_list = ({ params }) => {
  return get(api.brand_category_list, { params });
};

// 品牌件 - 获取品牌件产品列表
export const brand_category_product_list = ({ params }) => {
  return get(api.brand_category_product_list, {
    params: { brand_category_id: params.brand_category_id, category_name: params.category_name, page: params.page, perpage: params.perpage }
  });
};

// 品牌件 - 获取品牌件产品详情
export const brand_category_product_detail = ({ params }) => {
  return get(api.brand_category_product_detail + params.brand_category_id);
};

// 品牌件 - 品类名称是否可用【更新】
export const brand_category_name_valid_update = ({ params }) => {
  return get(api.brand_category_code_valid, {
    params: { type: params.type, brand_category_id: params.brand_category_id, brand_category_name: params.brand_category_name }
  });
};

// 品牌件 - 品类名称是否可用【添加】
export const brand_category_name_valid_add = ({ params }) => {
  return get(api.brand_category_code_valid, { params: { type: params.type, brand_category_name: params.brand_category_name } });
};

// 品牌件 - 品类编码是否可用【更新】
export const brand_category_code_valid_update = ({ params }) => {
  return get(api.brand_category_code_valid, {
    params: { type: params.type, brand_category_id: params.brand_category_id, brand_category_code: params.brand_category_code }
  });
};

// 品牌件 - 品类编码是否可用【添加】
export const brand_category_code_valid_add = ({ params }) => {
  return get(api.brand_category_code_valid, { params: { type: params.type, brand_category_code: params.brand_category_code } });
};

// 品牌件 - 产品编码是否可用【更新】
export const brand_product_code_valid_update = ({ params }) => {
  return get(api.brand_category_code_valid, {
    params: { type: params.type, brand_category_id: params.brand_category_id, product_id: params.product_id, product_code: params.product_code }
  });
};

// 品牌件 - 产品编码是否可用【添加】
export const brand_product_code_valid_add = ({ params }) => {
  return get(api.brand_category_code_valid, {
    params: { type: params.type, brand_category_id: params.brand_category_id, product_id: params.product_id, product_code: params.product_code }
  });
};

// 品牌件 - 产品名称是否可用【更新】
export const brand_product_name_valid_update = ({ params }) => {
  return get(api.brand_category_code_valid, {
    params: { type: params.type, brand_category_id: params.brand_category_id, product_id: params.product_id, product_name: params.product_name }
  });
};

// 品牌件 - 产品名称是否可用【添加】
export const brand_product_name_valid_add = ({ params }) => {
  return get(api.brand_category_code_valid, {
    params: { type: params.type, brand_category_id: params.brand_category_id, product_id: params.product_id, product_name: params.product_name }
  });
};

// 品牌件 - 添加产品
export const brand_product_add = ({ data }) => {
  return post(api.brand_product_add, { data });
};

// 品牌件 - 品类删除
export const brand_category_delete = ({ data }) => {
  return post(api.brand_category_delete, { data });
};

// 品牌件 - 创建品类和产品
export const brand_product_create = ({ data }) => {
  return post(api.brand_product_create, { data });
};

// 品牌件 - 产品拖动
export const brand_product_drag = ({ data }) => {
  return post(api.brand_product_drag, { data });
};

// 品牌件 - 产品和品类数据修改
export const brand_product_update = ({ data }) => {
  return post(api.brand_product_update, { data });
};

// 品牌件 - 品牌件品类图片上传
export const brand_category_image_upload = ({ data }) => {
  return post(api.brand_category_image_upload, { data });
};

/******************
 * OE管理
 ******************/

// OE管理-获取oem_partsku_id列表
export const oemsku_list = ({ params }) => {
  return get(api.oemsku_list, { params });
};

// OE管理-oem-获取车型品牌和id
export const carmodel_cmbrand_list = ({ params }) => {
  return get(api.carmodel_cmbrand_list);
};

// OE管理-获取品类属性信息
export const category_pro = ({ params }) => {
  return get(api.category_pro, { params });
};

// OE管理-获取oe信息详情
export const oemsku_edit_tab_info = ({ params }) => {
  return get(api.oemsku_edit_tab_info, { params });
};

// OE管理-获取oe车型tab信息详情
export const oemsku_carmodel_tab_info = ({ params }) => {
  return get(api.oemsku_carmodel_tab_info, { params });
};

// OE管理-车型不适配反馈页面
export const oemsku_carmodel_filter_info = ({ params }) => {
  return get(api.oemsku_carmodel_filter_info, { params: { oem_partsku_id: params.oem_partsku_id, cm_ids: params.cm_ids.join(',') } });
};

// OE管理-oem车型筛选
export const carmodel_keyvalue_list = ({ params }) => {
  return get(api.carmodel_keyvalue_list, { params });
};

// OE管理-获取oem合并页面数据
export const oemsku_info = ({ params }) => {
  return get(api.oemsku_info, { params });
};

// 标准码 - 商户反馈 - 获取oem车型信息
export const oemsku_carmodel = ({ params }) => {
  return get(api.oemsku_carmodel, { params });
};

// OE管理-根据条件获取合并页面列表
export const oemsku_merge_select = ({ params }) => {
  return get(api.oemsku_merge_select, { params });
};

// OE管理-oemsku审核
export const oemsku_approve = ({ data }) => {
  return post(api.oemsku_approve, { data });
};

// OE管理-添加oem code
// export const oemsku_code_add = ({ data }) => {
//     return post(api.oemsku_code_add, { data });
// };

// OE管理-删除oem code
// export const oemsku_code_delete = ({ data }) => {
//     return post(api.oemsku_code_delete, { data });
// };

// OE管理-添加oem 图片
// export const oemsku_image_add = ({ data }) => {
//   return post(api.oemsku_image_add, { data });
// };

// OE管理-删除oem 图片
// export const oemsku_image_delete = ({ data }) => {
//     return post(api.oemsku_image_delete, { data });
// };

// OE管理-拆分oem code
export const oemsku_code_split = ({ data }) => {
  return post(api.oemsku_code_split, { data });
};

// OE管理-更改oem 车型品牌id
// export const oemsku_carmodel_brand_update = ({ data }) => {
//   return post(api.oemsku_carmodel_brand_update, { data });
// };

// OE管理-更改oemsku 描述
// export const oemsku_desc_update = ({ data }) => {
//   return post(api.oemsku_desc_update, { data });
// };

// OE管理-更新品类属性值
// export const oemsku_pro_value_update = ({ data }) => {
//     return post(api.oemsku_pro_value_update, { data });
// };

// OE管理-用户反馈->设置已处理
export const oemsku_carmodel_filter_handled = ({ data }) => {
  return post(api.oemsku_carmodel_filter_handled, { data });
};

// OE管理-删除车型
export const oemsku_carmodel_delete = ({ data }) => {
  return post(api.oemsku_carmodel_delete, { data });
};

// OE管理-拆分车型
export const oemsku_carmodel_split = ({ data }) => {
  return post(api.oemsku_carmodel_split, { data });
};

// OE管理-创建oem
export const oemsku_create = ({ data }) => {
  return post(api.oemsku_create, { data });
};

// OE管理-更新oems（只有表单信息）
export const oemsku_update = ({ data }) => {
  return post(api.oemsku_update, { data });
};

// OE管理-添加车型
export const oemsku_carmodel_add = ({ data }) => {
  return post(api.oemsku_carmodel_add, { data });
};

// OE管理-oem删除
export const oemsku_delete = ({ data }) => {
  return post(api.oemsku_delete, { data });
};

// OE管理-oem合并
export const oemsku_merge = ({ data }) => {
  return post(api.oemsku_merge, { data });
};

// OE管理-oem不合并
export const oemsku_exclude = ({ data }) => {
  return post(api.oemsku_exclude, { data });
};

// OE管理 - oem的code校验【创建OE时用】
export const oemsku_code_check = ({ data }) => {
  return post(api.oemsku_code_check, { data });
};

// OE管理 - OE码sku图片上传
export const oe_sku_image_upload = ({ data }) => {
  return post(api.oe_sku_image_upload, { data });
};

// OE管理 - 获取OE价格
export const oemsku_price = ({ params }) => {
  return get(api.oemsku_price, { params });
};

// OE管理 - 更新OE价格
export const oemsku_price_update = ({ data }) => {
  return post(api.oemsku_price_update, { data });
};

// OE管理 - oe适配车型编辑查询
export const oemsku_carmodel_edit_list = ({ params }) => {
  return get(api.oemsku_carmodel_edit_list, { params });
};

// OE管理 - oe适配车型更新
export const oemsku_carmodel_edit = ({ data }) => {
  return post(api.oemsku_carmodel_edit, { data });
};

// oem保存并审核通过check
export const oemsku_approve_check = ({ params }) => {
  return get(api.oemsku_approve_check, { params });
};

// 同一个标准码下的oe全部审核通过
export const oemsku_approve_all = ({ data }) => {
  return post(api.oemsku_approve_all, { data });
};

// 获取品类禁用数据
export const categories_forbid = ({ params }) => {
  return get(api.categories_forbid, { params });
};

/******************
 * 标准码
 ******************/

// 标准码 - 标准码管理列表
export const stdsku_list = ({ params }) => {
  return get(api.stdsku_list, { params }
  );
};

// 标准码 - 标准码所覆盖OE码列表
export const stdsku_oe = ({ params }) => {
  return get(api.stdsku_oe, { params });
};

// 标准码 - std-获取标准码信息
export const stdsku_info = ({ params }) => {
  return get(api.stdsku_info, { params });
};

// 标准码 - 合并标准码列表
export const stdsku_match_get = ({ params }) => {
  return get(api.stdsku_match, { params });
};

// 标准码 - 合并标准码操作
export const stdsku_match_post = ({ data }) => {
  return post(api.stdsku_match, { data });
};

// 标准码 - 拆分
export const stdsku_oe_split = ({ data }) => {
  return post(api.stdsku_oe_split, { data });
};

// 标准码 - 商户反馈 - 确认已查看
export const oemsku_filter_handled = ({ data }) => {
  return post(api.oemsku_filter_handled, { data });
};

// 标准码 - 商户反馈 - 不匹配oe产品信息
export const oemsku_filter = ({ params }) => {
  return get(api.oemsku_filter, { params });
};

// 标准码 - 通用权重 - 根据通用依据获取品牌名称
export const partsku_brand = ({ params }) => {
  return get(api.partsku_brand, { params });
};

// 标准码 - 通用权重 - 列表查询
export const stdsku_weight_list = ({ params }) => {
  return get(api.stdsku_weight_list, { params });
};

// 标准码 - 通用权重 - 通用权重设置
export const stdsku_weight_update = ({ data }) => {
  return post(api.stdsku_weight_update, { data });
};

// 标准码 - 标准码合并操作
export const stdsku_merge = ({ data }) => {
  return post(api.stdsku_merge, { data });
};

// 标准码 - 标准码复制操作
export const stdsku_copy = ({ data }) => {
  return post(api.stdsku_copy, { data });
};

// 标准码 - 标准码sku图片上传
export const stdsku_image_upload = ({ data }) => {
  return post(api.stdsku_image_upload, { data });
};

// 标准码 - 标准码信息更新
export const stdsku_update = ({ data }) => {
  return post(api.stdsku_update, { data });
};

// 标准码 - 更新oe属性为标准码属性
export const stdsku_oesku = ({ data }) => {
  return post(api.stdsku_oesku, { data });
};

// 标准码 - 更新标准码属性为oe属性
export const oesku_stdsku = ({ data }) => {
  return post(api.oesku_stdsku, { data });
};

/******************
 * 大厂码
 ******************/

// 大厂码 - 获取大厂码列表数据/获取大厂品牌下拉列表数据/获取大厂码详情数据
export const fms_brands = ({ params = {} }) => {
  return get(api.fms_brands, { params });
};

export const fms_famous_brand = ({ params = {} }) => {
  return get(api.fms_famous_brand, { params });
};
export const fms_brand_famousIdCategory = ({ params = {} }) => {
  return get(api.fms_brand_famousIdCategory, { params });
};

// 大厂码 - 详情 - 获取已开通品类列表数据
export const fms_categories = ({ params = {} }) => {
  return get(api.fms_categories, { params });
};

// 大厂码 - 详情- 获取产品品类列表
export const fms_categories_parts = () => {
  return get(api.fms_categories_parts);
};

// 大厂码 - 创建品牌
export const fms_brands_create = ({ data }) => {
  return post(api.fms_brands_create, { data });
};

// 大厂码 - 编辑品牌
export const fms_brands_update = ({ data }) => {
  return post(api.fms_brands_update, { data });
};

// 大厂码 - 删除品牌
export const fms_brands_del = ({ data }) => {
  return post(api.fms_brands_del, { data });
};

// 大厂码 - 品类管理 - 修改品类状态
export const fms_categories_update = ({ data }) => {
  return post(api.fms_categories_update, { data });
};

// 大厂码 - 品类管理 - 修改产品状态
export const fms_parts_update = ({ data }) => {
  return post(api.fms_parts_update, { data });
};

// 大厂码 - 产品管理 - 产品列表
export const fms_parts = ({ params = {} }) => {
  return get(api.fms_parts, { params });
};

// 大厂码 - 产品管理 - 产品下拉列表
export const fms_partskus = ({ params = {} }) => {
  return get(api.fms_partskus, { params });
};

// 大厂码 - 产品管理 - 大厂品牌下拉列表
export const carmodel_brand_getFamousId = ({ params = {} }) => {
  return get(api.carmodel_brand_getFamousId, { params });
};
// 大厂码 - 产品管理 - 详情
export const fms_partskus_info = ({ params = {} }) => {
  return get(api.fms_partskus_info, { params });
};

// 大厂码 - 产品管理 - 品类属性
export const category_pros = ({ params = {} }) => {
  return get(api.category_pros, { params });
};

// 大厂码 - 产品管理 - 适配车型列表
export const fms_carmodel = ({ params = {} }) => {
  return get(api.fms_carmodel, { params });
};

// 大厂码 - 适配车型 - 添加适配车型 - 获取车型（OE）
export const carmodel_oe = ({ params = {} }) => {
  return get(api.carmodel_oe, { params });
};

// 大厂码 - 适配车型 - 添加适配车型 - 获取车型（车型参数）
export const carmodel_params = ({ params = {} }) => {
  return get(api.carmodel_params, { params });
};

// 大厂码 - 产品管理 - 创建配件
export const fms_partskus_create = ({ data }) => {
  return post(api.fms_partskus_create, { data });
};

// 大厂码 - 产品管理 - 编辑配件
export const fms_partskus_update = ({ data }) => {
  return post(api.fms_partskus_update, { data });
};

// 大厂码 - 产品管理 - 删除配件
export const fms_partskus_del = ({ data }) => {
  return post(api.fms_partskus_del, { data });
};

// 大厂码 - 产品管理 - 添加适配车型
export const fms_carmodel_add = ({ data }) => {
  return post(api.fms_carmodel_add, { data });
};

// 大厂码 - 产品管理 - 删除适配车型
export const fms_std_rel_del = ({ data }) => {
  return post(api.fms_std_rel_del, { data });
};

// 大厂码 - 适配车型 - 获取车型关键属性
export const carmodel_properties = ({ params = {} }) => {
  return get(api.carmodel_properties, { params });
};

// 大厂码 - 产品管理 - 更新产品状态F
export const fms_status_update = ({ data = {} }) => {
  return post(api.fms_status_update, { data });
};

// 大厂码 - 大厂管理 - 品牌名称重复验证
export const fms_brand_check = ({ data }) => {
  return post(api.fms_brand_check, { data });
};

// 大厂码 - 产品管理 - 产品编码重复验证
export const fms_partsku_code_check = ({ data }) => {
  return post(api.fms_partsku_code_check, { data });
};

// 大厂码 - 大厂管理 - 大厂码品牌图片上传
export const fms_brand_image_upload = ({ data }) => {
  return post(api.fms_brand_image_upload, { data });
};

// 大厂码 - 大厂管理 - 大厂码sku图片上传
export const fms_sku_image_upload = ({ data }) => {
  return post(api.fms_sku_image_upload, { data });
};

/******************
 * 行业码
 ******************/
// 行业码 - 列表
export const indus_brands = ({ params = {} }) => {
  return get(api.indus_brands, { params });
};
//行业码 -协会
export const indus_getIndsIdByBrandId = ({ params = {} }) => {
  return get(api.indus_getIndsIdByBrandId, { params });
};
// 行业码  产品
export const indus_indusyBrandId = ({ params = {} }) => {
  return get(api.indus_indusyBrandId, { params });
};
// 行业码 - 产品管理 - 列表
export const indus_partskus = ({ params = {} }) => {
  return get(api.indus_partskus, { params });
};

// 行业码 - 产品管理 - 详情
export const indus_partskus_info = ({ params = {} }) => {
  return get(api.indus_partskus_info, { params });
};

// 行业码 - 详情 - 获取产品品类列表
export const indus_categories_parts = ({ params = {} }) => {
  return get(api.indus_categories_parts, { params });
};

// 行业码 - 创建
export const indus_brands_create = ({ data = {} }) => {
  return post(api.indus_brands_create, { data });
};

// 行业码 - 删除
export const indus_std_rel_del = ({ data = {} }) => {
  return post(api.indus_std_rel_del, { data });
};

// 行业码 - 详情 - 获取已开通品类列表数据
export const indus_categories = ({ params = {} }) => {
  return get(api.indus_categories, { params });
};

// 行业码 - 编辑
export const indus_brands_update = ({ data = {} }) => {
  return post(api.indus_brands_update, { data });
};

// 行业码 - 删除品牌
export const indus_brands_del = ({ data }) => {
  return post(api.indus_brands_del, { data });
};

// 行业码 - 产品管理 - 添加适配车型
export const indus_carmodel_add = ({ data = {} }) => {
  return post(api.indus_carmodel_add, { data });
};

// 行业码 - 产品管理 - 创建配件
export const indus_partskus_create = ({ data = {} }) => {
  return post(api.indus_partskus_create, { data });
};

// 行业码 - 产品管理 - 删除配件
export const indus_partskus_del = ({ data = {} }) => {
  return post(api.indus_partskus_del, { data });
};

// 行业码 - 产品管理 - 编辑配件
export const indus_partskus_update = ({ data = {} }) => {
  return post(api.indus_partskus_update, { data });
};

// 行业码 - 产品管理 - 更新产品状态
export const indus_status_update = ({ data = {} }) => {
  return post(api.indus_status_update, { data });
};

// 行业码 - 品类管理 - 修改品类状态
export const indus_categories_update = ({ data = {} }) => {
  return post(api.indus_categories_update, { data });
};

// 行业码 - 产品管理 - 适配车型列表
export const indus_carmodel = ({ params = {} }) => {
  return get(api.indus_carmodel, { params });
};

// 行业码 -
export const indus_partskus_carmodel = ({ params = {} }) => {
  return get(api.indus_partskus_carmodel, { params });
};

// 行业码 -
export const indus_parts = ({ params = {} }) => {
  return get(api.indus_parts, { params });
};

// 行业码 - 品类管理 - 修改产品状态
export const indus_parts_update = ({ data = {} }) => {
  return post(api.indus_parts_update, { data });
};

// 行业码 - 行业协会 - 品牌名称重复验证
export const indus_brand_check = ({ data }) => {
  return post(api.indus_brand_check, { data });
};

// 行业码 - 产品管理 - 产品编码重复验证
export const indus_partsku_code_check = ({ data }) => {
  return post(api.indus_partsku_code_check, { data });
};

// 行业码 - 行业码品牌图片上传
export const indus_brand_image_upload = ({ data }) => {
  return post(api.indus_brand_image_upload, { data });
};

// 行业码 - 行业码sku图片上传
export const indus_sku_image_upload = ({ data }) => {
  return post(api.indus_sku_image_upload, { data });
};

/******************
 * 客户管理
 ******************/

// 客户管理 - 客户列表
export const customer_list = ({ params = {} }) => {
  return get(api.customer_list, { params });
};

// 客户管理 - 已开通服务
export const services = ({ params = {} }) => {
  return get(api.services, { params });
};

// 客户管理 - 获取地址信息
export const address = ({ params = {} }) => {
  return get(api.address, { params });
};

// 客户管理 - 更新客户信息
export const customer_info = ({ data }) => {
  return post(api.customer_info, { data });
};

/******************
 * 客户服务
 ******************/

// 客户服务 - 数据查询服务列表
export const tenant_brands = ({ params = {} }) => {
  return get(api.tenant_brands, { params });
};

// 客户服务 - 数据查询服务品牌编辑
export const service_brand_update = ({ data }) => {
  return post(api.service_brand_update, { data });
};

// 客户服务 - 数据查询服务品类编辑
export const service_category_update = ({ data }) => {
  return post(api.service_category_update, { data });
};

// 客户服务 - 获取品牌下的品类数据(自主生成)
export const tenant_categories = ({ params }) => {
  return get(api.tenant_categories, { params });
};
// 客户服务 - 获取品牌下的品类数据（代理经销）
export const tenant_dealer_categories = ({ params }) => {
  return get(api.tenant_dealer_categories, { params });
};
// 数据服务品类编辑（代理经销）
export const dealer_category_update = ({ data }) => {
  return post(api.dealer_category_update, { data });
};

// 客户服务 - 更新增值服务
export const tenant_category_service_update = ({ data }) => {
  return post(api.tenant_category_service_update, { data });
};

// 客户服务 - 更新商户行业码补充服务的品牌
export const tenant_category_service_indus = ({ data }) => {
  return post(api.tenant_category_service_indus, { data });
};

/******************
 * 清理vin缓存
 ******************/
export const vin_levelid_delete = ({ data }) => {
  return post(api.vin_levelid_delete, { data });
};
export const vin_jz_records = ({ params }) => {
  return get(api.vin_jz_records, { params });
};

/******************
 * 消息中心
 ******************/

// 获取消息记录总数（未读状态）
export const MESSAGES = () => {
  return get(api.MESSAGES);
};

// 获取消息记录列表
export const MSG_RECORDS = ({ params }) => {
  return get(api.MSG_RECORDS, { params });
};

// 消息读取
export const MSG_RECORD = ({ data }) => {
  return post(api.MSG_RECORD, { data });
};

/******************
 * 平台设置
 ******************/
export const stdsku_config_post = ({ data }) => {
  return post(api.stdsku_config, { data });
};

export const stdsku_config_get = ({ params }) => {
  return get(api.stdsku_config, { params });
};

/******************
 * OE覆盖率
 ******************/

// OE&车型品牌覆盖率
export const oem_cover = ({ params }) => {
  return get(api.oem_cover, { params });
};
export const oem_cover_carmodels = ({ params }) => {
  return get(api.oem_cover_carmodels, { params });
};
export const oem_cover_partskus = ({ params }) => {
  return get(api.oem_cover_partskus, { params });
};
export const oem_cover_partskus_search = ({ params }) => {
  return get(api.oem_cover_partskus_search, { params });
};
export const oem_cover_partskus_post = ({ data }) => {
  return post(api.oem_cover_partskus, { data });
};

/******************
 * OE待归类
 ******************/
export const OEM_TMP_LIST = ({ params }) => {
  return get(api.OEM_TMP_LIST, { params });
};
export const OEM_TMP_CMVALUES = ({ params }) => {
  return get(api.OEM_TMP_CMVALUES, { params });
};
export const OEM_TMP_PRICE = ({ params }) => {
  return get(api.OEM_TMP_PRICE, { params });
};
export const OEM_TMP_PARTNAME = ({ params }) => {
  return get(api.OEM_TMP_PARTNAME, { params });
};
export const OEM_TMP_CMBRAND = ({ params }) => {
  return get(api.OEM_TMP_CMBRAND, { params });
};
export const OEM_TMP_DEL = ({ data }) => {
  return post(api.OEM_TMP_DEL, { data });
};
export const OEM_TMP_MARK = ({ data }) => {
  return post(api.OEM_TMP_MARK, { data });
};

// 车型反馈列表
export const feedback_carmodels = ({ params }) => {
  return get(api.feedback_carmodels, { params });
};

// 车型反馈回复列表
export const feedback_carmodel_detailed = ({ params }) => {
  return get(api.feedback_carmodel_detailed, { params });
};
// 车型反馈图片上传
export const feedback_carmodel_uploadImg = ({ data }) => {
  return post(api.feedback_carmodel_uploadImg, { data });
};

// 车型反馈回复
export const feedback_carmodel_reply = ({ data }) => {
  return post(api.feedback_carmodel_reply, { data });
};
// 车型反馈批量处理
export const feedback_carmodels_process = ({ data }) => {
  return post(api.feedback_carmodels_process, { data });
};
// 车型反馈更新反馈状态
export const feedback_carmodel_status = ({ data }) => {
  return post(api.feedback_carmodel_status, { data });
};
// 车型反馈更新反馈状态
export const feedback_systems = ({ params }) => {
  return get(api.feedback_systems, { params });
};

// 功能反馈回复列表
export const feedback_system_detailed = ({ params }) => {
  return get(api.feedback_system_detailed, { params });
};

// 功能反馈回复
export const feedback_system_reply = ({ data }) => {
  return post(api.feedback_system_reply, { data });
};

// 功能反馈图片上传
export const feedback_system_uploadImg = ({ data }) => {
  return post(api.feedback_system_uploadImg, { data });
};

// 功能反馈批量处理
export const feedback_system_batchProcess = ({ data }) => {
  return post(api.feedback_system_batchProcess, { data });
};

// 功能反馈更新反馈状态
export const feedback_system_status = ({ data }) => {
  return post(api.feedback_system_status, { data });
};

// 车型反馈批量导出列表
export const feedback_carmodels_export = ({ params }) => {
  return get(api.feedback_carmodels_export, { params });
};

// 功能反馈批量导出列表
export const feedback_systems_export = ({ params }) => {
  return get(api.feedback_systems_export, { params });
};

// 产品反馈列表
export const tenant_feedbacks = ({ params }) => {
  return get(api.tenant_feedbacks, { params });
};

// 产品反馈批量操作
export const tenant_feedback_operation = ({ data }) => {
  return post(api.tenant_feedback_operation, { data });
};

// 产品反馈批量导出列表
export const tenant_feedbacks_export = ({ params }) => {
  return get(api.tenant_feedbacks_export, { params });
};

// 产品反馈回复列表
export const tenant_feedback_detailed = ({ params }) => {
  return get(api.tenant_feedback_detailed, { params });
};

// 大厂品牌
export const fms_brand_getFamousId = ({ params }) => {
  return get(api.fms_brand_getFamousId, { params });
};


/** 修改密码 */
export const manager_updatePassword = ({ data }) => {
  return post(api.manager_updatePassword, { data });
};


/**
 * VIN
 */

/** VIN查询 */
export const vin_vinQuery = ({ data }) => {
  return post(api.vin_vinQuery, { data });
};
/** VIN查询 */
export const vin_white_list = ({ data }) => {
  return post(api.vin_white_list, { data });
};

/** 品牌小程序列表 */
export const weapps = ({ params }) => {
  return get(api.weapps, { params });
};
/** 小程序版本列表 */
export const weapp_templates = ({ params }) => {
  return get(api.weapp_templates, { params });
};
/** 发布小程序 */
export const weapp_audit = ({ data }) => {
  return post(api.weapp_audit, { data });
};
/** 小程序回退 */
export const weapp_revert = ({ data }) => {
  return post(api.weapp_revert, { data });
};
/** 小程序审核撤回 */
export const weapp_audit_undo = ({ data }) => {
  return post(api.weapp_audit_undo, { data });
};
/** 获取小程序码 */
export const weapp_qrcode = ({ params }) => {
  return get(api.weapp_qrcode, { params });
};

/** 二维码显示关闭开关 */
export const manager_setManagerBrand = ({ params }) => {
  return get(api.manager_setManagerBrand, { params });
};

/**获取用户列表 */
export const manager_getUserList = ({ params }) => {
  return get(api.manager_getUserList, { params });
};

/**获取角色列表 */
export const manager_selectRole = ({ params }) => {
  return get(api.manager_selectRole, { params });
};

/**获取品类列表列表 */
export const manager_allBrandCategory = ({ params }) => {
  return get(api.manager_allBrandCategory, { params });
};

/**创建用户 */
export const manager_insertUser = ({ data }) => {
  return post(api.manager_insertUser, { data });
};


/**通过品牌/主机厂/车型获取 车辆信息 */
export const carmodel_getCminfoBytype = ({ params }) => {
  return get(api.carmodel_getCminfoBytype, { params });
};

/**获取品类列表列表 */
export const manager_updateUserInfo = ({ params }) => {
  return get(api.manager_updateUserInfo, { params });
};


/**获取品类列表列表 */
export const manager_getUserDetail = ({ params }) => {
  return get(api.manager_getUserDetail, { params });
};

/**修改用户角色权限 */
export const manager_updateuserRole = ({ params }) => {
  return get(api.manager_updateuserRole, { params });
};


/**修改用户品类权限 */
export const manager_updateuserCategory = ({ params }) => {
  return get(api.manager_updateuserCategory, { params });
};


/**删除用户 */
export const manager_deleteUser = ({ params }) => {
  return get(api.manager_deleteUser, { params });
};


/**角色列表 */
export const manager_selectRoleList = ({ params }) => {
  return get(api.manager_selectRoleList, { params });
};


/**删除角色 */
export const manager_deleteRole = ({ params }) => {
  return get(api.manager_deleteRole, { params });
};


/**菜单列表 */
export const manager_getmenuAllList = ({ params }) => {
  return get(api.manager_getmenuAllList, { params });
};


/**创建角色 */
export const manager_insertRole = ({ data }) => {
  return post(api.manager_insertRole, { data });
};

/**获取操作日志 */
export const userRecorList =({ params }) =>{
  return get(api.userRecorList,{ params });
};

/**插入操作日志 */
export const userRecord = ({ data }) =>{
  return post(api.userRecord,{data});
};
export const manager_alluser = ({ params }) =>{
  return get(api.manager_alluser,{params});
};

/** 应用商店 */

export const market_insert = ({ data }) =>{
  return post(api.market_insert,{data});
};
export const market_image_upload = ({ data }) =>{
  return post(api.market_image_upload,{data});
};
export const market_update = ({ data }) =>{
  return post(api.market_update,{data});
};
export const market_get_apps = ({ params }) =>{
  return get(api.market_get_apps,{params});
};
export const market_get_jobs = ({ params }) =>{
  return get(api.market_get_jobs,{params});
};
export const market_get_orders = ({ params }) =>{
  return get(api.market_get_orders,{params});
};
export const market_get_brands = ({ params }) =>{
  return get(api.market_get_brands,{params});
};
export const market_get_ten_categories = ({ params }) =>{
  return get(api.market_get_ten_categories,{params});
};
export const market_handjob = ({ data }) =>{
  return post(api.market_handjob,{data});
};
export const market_handjob_status = ({ params }) =>{
  return get(api.market_handjob_status,{params});
};
export const market_open_range_num = ({ params }) =>{
  return get(api.market_open_range_num,{params});
};

/** 标签 */
export const ten_add_label = ({ params }) =>{
  return get(api.ten_add_label,{params});
};
export const ten_label_check = ({ params }) =>{
  return get(api.ten_label_check,{params});
};
export const ten_label = ({ params }) =>{
  return get(api.ten_label,{params});
};
export const ten_get_labels = ({ params }) =>{
  return get(api.ten_get_labels,{params});
};
export const ten_label_rel = ({ data }) =>{
  return post(api.ten_label_rel,{data});
};
export const ten_batch_add_label = ({ data }) =>{
  return post(api.ten_batch_add_label,{data});
};
export const ten_update_label = ({ data }) =>{
  return post(api.ten_update_label,{data});
};
export const ten_delete_label = ({ data }) =>{
  return post(api.ten_delete_label,{data});
};
export const get_marker_tens = ({ params }) =>{
  return get(api.get_marker_tens,{params});
};
export const get_tens_labels = ({ params }) =>{
  return get(api.get_tens_labels,{params});
};
export const get_markers_by_type = ({ params }) =>{
  return get(api.get_markers_by_type,{params});
};
export const get_market_whitelist_label = ({ params }) =>{
  return get(api.get_market_whitelist_label,{params});
};
export const add_whitelist_label = ({ data }) =>{
  return post(api.add_whitelist_label,{data});
};
export const get_whitelist_tens = ({ params }) =>{
  return get(api.get_whitelist_tens,{params});
};
export const del_whitelist_ten = ({ params }) =>{
  return get(api.del_whitelist_ten,{params});
};
export const add_whitelist_tens = ({ params }) =>{
  return get(api.add_whitelist_tens,{params});
};
export const weapp_domain = ({ params }) =>{
  return get(api.weapp_domain,{params});
};
export const weapp_domain_post = ({ data }) =>{
  return post(api.weapp_domain, { data });
};
export const weapp_support_version = ({ data }) =>{
  return post(api.weapp_support_version, { data });
};
export const market_app_config = ({ params }) =>{
  return get(api.market_app_config,{params});
};
export const market_app_check = ({ params }) =>{
  return get(api.market_app_check,{params});
};

/** 商用车标准化 */
export const liyang_cms_commercial = ({ params }) =>{
  return get(api.liyang_cms_commercial,{params});
};
export const liyang_cms_total_commercial_brand_fac_mod = ({ params }) =>{
  return get(api.liyang_cms_total_commercial_brand_fac_mod,{params});
};
export const liyang_cms_total_commercial_format = ({ data }) =>{
  return post(api.liyang_cms_total_commercial_format,{data});
};
/** 批量修改审核 */
export const carmodel_batch_update_column_bykey_get = ({ data }) =>{
  return post(api.carmodel_batch_update_column_bykey_get,{data});
};
export const carmodel_batch_update_column_bykey = ({ data }) =>{
  return post(api.carmodel_batch_update_column_bykey,{data});
};
export const carmodel_batch_update_column_byOrigin = ({ data }) =>{
  return post(api.carmodel_batch_update_column_byOrigin,{data});
};
export const carmodel_batch_update_column_byOrigin_get = ({ params }) =>{
  return get(api.carmodel_batch_update_column_byOrigin_get,{params});
};

/** 源车型审核  */
export const carmodel_origin_pending_list = ({ params }) =>{
  return get(api.carmodel_origin_pending_list, { params });
};
export const carmodel_origin_pending_count = ({ params }) =>{
  return get(api.carmodel_origin_pending_count, { params });
};
export const carmodel_origin_approved = ({ data }) =>{
  return post(api.carmodel_origin_approved,{data});
};
export const carmodel_origin_unapproved = ({ data }) =>{
  return post(api.carmodel_origin_unapproved,{data});
};
export const carmodel_origin_pending_info = ({ params }) =>{
  return get(api.carmodel_origin_pending_info, { params });
};
export const carmodel_origin_column_name = ({ params }) =>{
  return get(api.carmodel_origin_column_name, { params });
};
/** 个性端口-用户颜色  */
export const app_theme_colors = ({ params }) =>{
  return get(api.app_theme_colors, { params });
};
export const market_color_download = ({ params }) =>{
  return get(api.market_color_download, { params });
};
export const market_add_theme_color = ({ data }) =>{
  return post(api.market_add_theme_color,{data});
};
export const update_app_theme_color = ({ data }) =>{
  return post(api.update_app_theme_color,{data});
};
export const delete_app_theme_color = ({ data }) =>{
  return post(api.delete_app_theme_color,{data});
};

/** 数据统计-端口统计  */
export const statistics_overall = ({ params }) =>{
  return get(api.statistics_overall, { params });
};
export const statistics_ten_brand = ({ params }) =>{
  return get(api.statistics_ten_brand, { params });
};
export const statistics_last_period = ({ params }) =>{
  return get(api.statistics_last_period, { params });
};
export const statistics_brand_trend = ({ params }) =>{
  return get(api.statistics_brand_trend, { params });
};
export const statistics_last_trend = ({ params }) =>{
  return get(api.statistics_last_trend, { params });
};
/** 用户管理-账户管理  */
export const user_ip_block_list = ({ params }) =>{
  return get(api.user_ip_block_list, { params });
};
export const user_plugin_block_list = ({ params }) =>{
  return get(api.user_plugin_block_list, { params });
};

export const user_ip_unblock = ({ data }) =>{
  return post(api.user_ip_unblock, { data });
};
export const user_plugin_unblock = ({ data }) =>{
  return post(api.user_plugin_unblock, { data });
};


export const oemsku_pro_value = ({ params }) =>{
  return get(api.oemsku_pro_value, { params });
};