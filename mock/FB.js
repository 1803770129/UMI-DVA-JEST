export default {
  //   // 车型反馈列表
  //   'GET /api/manager/v2.0/feedback/carmodels': {
  //     code: 0,
  //     msg: 'OK',
  //     status: 'ok',
  //     data: [
  //       {
  //         feedback_cm_id: '7630841254388251231', //车型反馈id
  //         feedback_cm_code: '20195566', //车型反馈单编号
  //         feedback_cm_car: '奥迪 A8 2000款', //车型反馈的车型（品牌，车型，排量等）
  //         feedback_cm_content: '查不到这款车型', //车型反馈内容
  //         feedback_image_url: [
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //         ], //车型反馈图片url
  //         person_name: '用户名称', //反馈人名称
  //         feedback_cm_phone: '13570336091', //反馈人电话
  //         update_time: '2018.12.5 11:30:24', //修改时间
  //         feedback_cm_status: 'PENDING', //处理状态PENDING:待处理， PROCESSING:处理中，OVER:已处理）
  //         feedback_cm_staff: '客服员A', //反馈处理担当者
  //         unread_count: 2,
  //       },
  //       {
  //         feedback_cm_id: '7630841254388251232', //车型反馈id
  //         feedback_cm_code: '20195566', //车型反馈单编号
  //         feedback_cm_car: '奥迪 A8 2000款', //车型反馈的车型（品牌，车型，排量等）
  //         feedback_cm_content: '查不到这款车型', //车型反馈内容
  //         feedback_image_url: [
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //         ], //车型反馈图片url
  //         person_name: '用户名称', //反馈人名称
  //         feedback_cm_phone: '13570336091', //反馈人电话
  //         update_time: '2018.12.5 11:30:24', //修改时间
  //         feedback_cm_status: 'PROCESSING', //处理状态PENDING:待处理， PROCESSING:处理中，OVER:已处理）
  //         feedback_cm_staff: '客服员A', //反馈处理担当者
  //         unread_count: 0,
  //       },
  //       {
  //         feedback_cm_id: '7630841254388251233', //车型反馈id
  //         feedback_cm_code: '20195566', //车型反馈单编号
  //         feedback_cm_car: '奥迪 A8 2000款', //车型反馈的车型（品牌，车型，排量等）
  //         feedback_cm_content: '查不到这款车型', //车型反馈内容
  //         feedback_image_url: [], //车型反馈图片url
  //         person_name: '用户名称', //反馈人名称
  //         feedback_cm_phone: '13570336091', //反馈人电话
  //         update_time: '2018.12.5 11:30:24', //修改时间
  //         feedback_cm_status: 'OVER', //处理状态PENDING:待处理， PROCESSING:处理中，OVER:已处理）
  //         feedback_cm_staff: '客服员A', //反馈处理担当者
  //         unread_count: 0,
  //       },
  //     ],
  //     count: 50,
  //   },
  //   // 车型反馈列表
  //   'GET /api/manager/v2.0/feedback/carmodel/detailed': {
  //     code: 0,
  //     msg: 'OK',
  //     status: 'ok',
  //     data: [
  //       {
  //         feedback_cm_id: '1', //车型反馈id
  //         feedback_cm_code: '20195566', //车型反馈单编号
  //         feedback_cm_car: '奥迪 A8 2000款', //车型反馈的车型（品牌，车型，排量等）
  //         feedback_cm_process_content: '', //反馈单处理内容
  //         feedback_cm_content: '查不到这款车型', //反馈内容
  //         feedback_cm_process_stance: 'USER', //反馈单处理立场（SOPEI:搜配,USER:用户）
  //         feedback_image_url: [
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //         ], //车型反馈图片url
  //         feedback_cm_process_index: '1', //反馈单处理顺序
  //         person_name: '用户名称', //反馈人名称
  //         feedback_cm_phone: '13570336091', //反馈人手机号
  //         update_time: '2018.12.5 11:30:24', //更新时间
  //         feedback_cm_status: 'PENDING', //处理状态PENDING:待处理， PROCESSING:处理中，OVER:已处理）
  //         feedback_cm_staff: '客服A', //反馈处理担当者
  //       },
  //       {
  //         feedback_cm_id: '2', //车型反馈id
  //         feedback_cm_code: '20195566', //车型反馈单编号
  //         feedback_cm_car: '奥迪 A8 2000款', //车型反馈的车型（品牌，车型，排量等）
  //         feedback_cm_process_content: '您的反馈内容准确有效, 我们已经处理，感谢您的支持', //反馈单处理内容
  //         feedback_cm_content: '', //反馈内容
  //         feedback_cm_process_stance: 'SOPEI', //反馈单处理立场（SOPEI:搜配,USER:用户）
  //         feedback_image_url: [
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //         ], //车型反馈图片url
  //         feedback_cm_process_index: '2', //反馈单处理顺序
  //         person_name: '用户名称', //反馈人名称
  //         feedback_cm_phone: '13570336091', //反馈人手机号
  //         update_time: '2018.12.5 11:30:24', //更新时间
  //         feedback_cm_status: 'OVER', //处理状态PENDING:待处理， PROCESSING:处理中，OVER:已处理）
  //         feedback_cm_staff: '客服A', //反馈处理担当者
  //       },
  //     ],
  //   },

  //   // 车型反馈图片上传
  //   'POST /api/manager/v2.0/feedback/carmodel/uploadImg': {
  //     code: 0,
  //     msg: 'OK',
  //     status: 'ok',
  //     data: [
  //       {
  //         feedback_cm_image_id: '213123123123', //反馈车型图片id
  //         feedback_cm_image_url: '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg', //反馈车型图片url
  //       },
  //     ],
  //   },

  //   // 车型反馈回复
  //   'POST /api/manager/v2.0/feedback/carmodel/reply': {
  //     code: 0,
  //     msg: 'OK',
  //     status: 'ok',
  //     data: {}
  //   },
  //   // 车型反馈批量处理
  //   'POST /api/manager/v2.0/feedback/carmodels/process': {
  //     code: 0,
  //     msg: 'OK',
  //     status: 'ok',
  //     data: {}
  //   },
  //   // 车型反馈批量处理
  //   'POST /api/manager/v2.0/feedback/carmodel/status': {
  //     code: 0,
  //     msg: 'OK',
  //     status: 'ok',
  //     data: {}
  //   },
  //   // 系统反馈列表
  //   'GET /api/manager/v2.0/feedback/systems': {
  //     code: 0,
  //     msg: 'OK',
  //     status: 'ok',
  //     data: [
  //       {
  //         sys_feedback_id: '7630841254388251231', //功能反馈id
  //         sys_feedback_code: '20195566', //功能反馈单编号
  //         app_name: '搜配用户端', //应用名称
  //         sys_feedback_content: '查不到这款车型', //功能反馈内容
  //         sys_feedback_image_url: [
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //         ], //车型反馈图片url
  //         person_name: '用户名称', //反馈人名称
  //         sys_feedback_phone: '13570336091', //反馈人电话
  //         update_time: '2018.12.5 11:30:24', //修改时间
  //         sys_feedback_status: 'PENDING', //处理状态PENDING:待处理， PROCESSING:处理中，OVER:已处理）
  //         unread_count: 2,
  //       },
  //       {
  //         sys_feedback_id: '7630841254388251232', //功能反馈id
  //         sys_feedback_code: '20195566', //功能反馈单编号
  //         app_name: '搜配用户端', //应用名称
  //         sys_feedback_content: '查不到这款车型', //功能反馈内容
  //         sys_feedback_image_url: [
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //         ], //车型反馈图片url
  //         person_name: '用户名称', //反馈人名称
  //         sys_feedback_phone: '13570336091', //反馈人电话
  //         update_time: '2018.12.5 11:30:24', //修改时间
  //         sys_feedback_status: 'PROCESSING', //处理状态PENDING:待处理， PROCESSING:处理中，OVER:已处理）
  //         unread_count: 0,
  //       },
  //       {
  //         sys_feedback_id: '7630841254388251233', //功能反馈id
  //         sys_feedback_code: '20195566', //功能反馈单编号
  //         app_name: '搜配用户端', //应用名称
  //         sys_feedback_content: '查不到这款车型', //功能反馈内容
  //         sys_feedback_image_url: [
  //         ], //车型反馈图片url
  //         person_name: '用户名称', //反馈人名称
  //         sys_feedback_phone: '13570336091', //反馈人电话
  //         update_time: '2018.12.5 11:30:24', //修改时间
  //         sys_feedback_status: 'OVER', //处理状态PENDING:待处理， PROCESSING:处理中，OVER:已处理）
  //         unread_count: 0,
  //       },
  //     ],
  //     count: 50,
  //   },
  //   // 车型反馈列表
  //   'GET /api/manager/v2.0/feedback/system/detailed': {
  //     code: 0,
  //     msg: 'OK',
  //     status: 'ok',
  //     data: [
  //       {
  //         sys_feedback_id: '1', //功能反馈id
  //         sys_feedback_code: '20195566', //功能反馈单编号
  //         app_name: '搜配用户端', //应用名称
  //         sys_feedback_process_content: '', //反馈单处理内容
  //         sys_feedback_content: '查不到这款车型', //功能反馈内容
  //         sys_feedback_process_stance: 'USER', //反馈单处理立场（SOPEI:搜配,USER:用户）
  //         sys_feedback_image_url: [
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //         ], //功能反馈图片url
  //         sys_feedback_process_index: '1', //反馈单处理顺序
  //         person_name: '用户名称', //反馈人名称
  //         sys_feedback_phone: '13570336091', //反馈人手机号
  //         update_time: '2018.12.5 11:30:24', //更新时间
  //         sys_feedback_status: 'PENDING', //处理状态PENDING:待处理， PROCESSING:处理中，OVER:已处理）
  //       },
  //       {
  //         sys_feedback_id: '2', //功能反馈id
  //         sys_feedback_code: '20195566', //功能反馈单编号
  //         app_name: '搜配用户端', //应用名称
  //         sys_feedback_process_content: '您的反馈内容准确有效, 我们已经处理，感谢您的支持', //反馈单处理内容
  //         sys_feedback_content: '', //功能反馈内容
  //         sys_feedback_process_stance: 'SOPEI', //反馈单处理立场（SOPEI:搜配,USER:用户）
  //         sys_feedback_image_url: [
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //           '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg',
  //         ], //功能反馈图片url
  //         sys_feedback_process_index: '1', //反馈单处理顺序
  //         person_name: '用户名称', //反馈人名称
  //         sys_feedback_phone: '13570336091', //反馈人手机号
  //         update_time: '2018.12.5 11:30:24', //更新时间
  //         sys_feedback_status: 'OVER', //处理状态PENDING:待处理， PROCESSING:处理中，OVER:已处理）
  //       }
  //     ],
  //   },
  //   // 功能反馈回复
  //   'POST /api/manager/v2.0/feedback/system/detailed': {
  //     code: 0,
  //     msg: 'OK',
  //     status: 'ok',
  //     data: {}
  //   },
  //   // 功能反馈图片上传
  //   'POST /api/manager/v2.0/feedback/system/uploadImg': {
  //     code: 0,
  //     msg: 'OK',
  //     status: 'ok',
  //     data: [
  //       {
  //         sys_feedback_image_id: '213123123123', //反馈车型图片id
  //         sys_feedback_image_url: '/tenant/brand/2d01b6d211383115959600cf64baf924.jpeg', //反馈车型图片url
  //       },
  //     ],
  //   },

  //   // 功能反馈批量处理
  //   'POST /api/manager/v2.0/feedback/system/batchProcess': {
  //     code: 0,
  //     msg: 'OK',
  //     status: 'ok',
  //     data: {},
  //   },

  //   // 功能反馈更新反馈状态
  //   'POST /api/manager/v2.0/feedback/system/status': {
  //     code: 0,
  //     msg: 'OK',
  //     status: 'ok',
  //     data: {},
  //   },

  // 产品反馈列表
  // '/api/manager/v2.0/tenant/feedbacks': {
  //   code: 0,
  //   msg: 'OK',
  //   status: 'ok',
  //   data: [
  //     {
  //       ten_feedback_id: '', // 反馈单ID
  //       ten_feedback_code: '', // 反馈单编码
  //       ten_brand_id: '',
  //       ten_brand_name: '',
  //       ten_category_id: '',
  //       brand_category_id: '',
  //       brand_category_name: '',
  //       ten_partsku_code: '',
  //       ten_feedback_content: '', // 反馈内容
  //       ten_feedback_images: [
  //         {
  //           ten_feedback_image_url: '',
  //           ten_feedback_image_name: '',
  //         },
  //       ], // 反馈图片
  //       person_name: '', // 反馈人名称
  //       ten_feedback_phone: '', // 反馈人手机号
  //       ten_feedback_time: '', // 反馈时间
  //       ten_feedback_status: '', // 处理状态
  //       ten_feedback_operation: '', //管理后台操作标记
  //       unread_count: 0,
  //     },
  //   ],
  //   count: 50,
  // },
};
