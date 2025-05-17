// 商户产品关联模拟数据
export const merchantProductList = [
  {
    id: 1,
    merchantNo: 'M20240318001',
    merchantName: '商户A',
    productName: '产品A',
    productCode: '8888',
    rate: 10.00,
    weight: 1,
    remark: '',
    customOption: true,
    selectedChannels: [
      { name: '渠道A', rate: 6 },
      { name: '渠道B', rate: 6 },
      { name: '渠道C', rate: 6 }
    ]
  },
  {
    id: 2,
    merchantNo: 'M20240318001',
    merchantName: '商户A',
    productName: '产品B',
    productCode: 'WX001',
    rate: 3.50,
    weight: 10,
    remark: '产品B优先',
    customOption: true,
    selectedChannels: [
      { name: '渠道A', rate: 6 },
      { name: '渠道B', rate: 6 }
    ]
  },
  {
    id: 3,
    merchantNo: 'M20240318001',
    merchantName: '商户A',
    productName: '产品C',
    productCode: 'ZFB001',
    rate: 3.00,
    weight: 8,
    remark: '产品C次优先',
    customOption: true,
    selectedChannels: [
      { name: '渠道A', rate: 6 },
      { name: '渠道B', rate: 6 },
      { name: '渠道C', rate: 6 },
      { name: '渠道D', rate: 6 }
    ]
  },
  {
    id: 4,
    merchantNo: 'M20240318002',
    merchantName: '商户B',
    productName: '产品D',
    productCode: 'YL001',
    rate: 2.80,
    weight: 5,
    remark: '标准费率',
    customOption: true,
    selectedChannels: [
      { name: '渠道A', rate: 6 },
      { name: '渠道B', rate: 6 },
      { name: '渠道C', rate: 6 }
    ]
  },
  {
    id: 5,
    merchantNo: 'M20240318002',
    merchantName: '商户B',
    productName: '产品E',
    productCode: 'YSF001',
    rate: 2.50,
    weight: 7,
    remark: '优惠费率',
    customOption: true,
    selectedChannels: [
      { name: '渠道A', rate: 6 },
      { name: '渠道B', rate: 6 }
    ]
  },
  {
    id: 6,
    merchantNo: 'M20240318003',
    merchantName: '商户C',
    productName: '产品B',
    productCode: 'WX001',
    rate: 3.20,
    weight: 9,
    remark: '特约商户',
    customOption: false,
    selectedChannels: [
      { name: '渠道A', rate: 6 },
      { name: '渠道B', rate: 6 }
    ]
  },
  {
    id: 7,
    merchantNo: 'M20240318004',
    merchantName: '商户D',
    productName: '产品F',
    productCode: 'ICC001',
    rate: 4.50,
    weight: 3,
    remark: '高费率',
    customOption: false,
    selectedChannels: [
      { name: '渠道A', rate: 6 },
      { name: '渠道B', rate: 6 },
      { name: '渠道C', rate: 6 }
    ]
  },
  {
    id: 8,
    merchantNo: 'M20240318005',
    merchantName: '商户E',
    productName: '产品G',
    productCode: 'QP001',
    rate: 2.60,
    weight: 6,
    remark: '标准费率',
    customOption: false,
    selectedChannels: [
      { name: '渠道A', rate: 6 },
      { name: '渠道B', rate: 6 },
      { name: '渠道C', rate: 6 },
      { name: '渠道D', rate: 6 }
    ]
  },
  {
    id: 9,
    merchantNo: 'M20240318006',
    merchantName: '商户F',
    productName: '产品H',
    productCode: 'AGG001',
    rate: 3.80,
    weight: 4,
    remark: '综合费率',
    customOption: false,
    selectedChannels: [
      { name: '渠道A', rate: 6 },
      { name: '渠道B', rate: 6 }
    ]
  },
  {
    id: 10,
    merchantNo: 'M20240318007',
    merchantName: '商户G',
    productName: '产品I',
    productCode: 'SCAN001',
    rate: 2.20,
    weight: 8,
    remark: '优惠费率',
    customOption: false,
    selectedChannels: [
      { name: '渠道A', rate: 6 },
      { name: '渠道B', rate: 6 },
      { name: '渠道C', rate: 6 }
    ]
  }
]; 