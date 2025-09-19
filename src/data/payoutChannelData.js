// 代付上游通道管理模拟数据

export const payoutChannelData = {
  // 通道列表数据
  channels: [
    {
      id: 7,
      channelName: '代付通道A',
      channelCode: '1',
      channelRate: 6.00,
      fixedFee: 1.00,
      upstreamName: '代付上游A',
      upstreamCode: 'UpstreamA',
      paymentType: '银行卡',
      group: '默认分组',
      status: 1
    },
    {
      id: 6,
      channelName: '代付通道B',
      channelCode: '1',
      channelRate: 6.00,
      fixedFee: 1.00,
      upstreamName: '代付上游B',
      upstreamCode: 'UpstreamB',
      paymentType: '银行卡',
      group: '默认分组',
      status: 1
    },
    {
      id: 5,
      channelName: '代付通道C',
      channelCode: '0',
      channelRate: 0.60,
      fixedFee: 1.00,
      upstreamName: '代付上游C',
      upstreamCode: 'UpstreamC',
      paymentType: '银行卡',
      group: '默认分组',
      status: 1
    },
    {
      id: 4,
      channelName: '代付通道D',
      channelCode: '11',
      channelRate: 0.60,
      fixedFee: 1.00,
      upstreamName: '代付上游D',
      upstreamCode: 'UpstreamD',
      paymentType: '银行卡',
      group: '默认分组',
      status: 1
    },
    {
      id: 3,
      channelName: '代付通道E',
      channelCode: '0',
      channelRate: 0.60,
      fixedFee: 0.00,
      upstreamName: '代付上游E',
      upstreamCode: 'UpstreamE',
      paymentType: '银行卡',
      group: '默认分组',
      status: 1
    },
    {
      id: 2,
      channelName: '代付通道F',
      channelCode: '99',
      channelRate: 0.60,
      fixedFee: 1.00,
      upstreamName: '代付上游F',
      upstreamCode: 'UpstreamF',
      paymentType: '支付宝H5',
      group: '高级分组',
      status: 1
    },
    {
      id: 1,
      channelName: '代付通道G',
      channelCode: '88',
      channelRate: 0.80,
      fixedFee: 2.00,
      upstreamName: '代付上游G',
      upstreamCode: 'UpstreamG',
      paymentType: '银行卡',
      group: '默认分组',
      status: 0
    },
    {
      id: 8,
      channelName: '新通道_测试8',
      channelCode: '12',
      channelRate: 1.20,
      fixedFee: 1.50,
      upstreamName: '熊猫代付',
      upstreamCode: 'NewTestPay',
      paymentType: '银行卡',
      group: '高级分组',
      status: 1
    },
    {
      id: 9,
      channelName: '快速代付_通道9',
      channelCode: '15',
      channelRate: 0.45,
      fixedFee: 0.80,
      upstreamName: '流川枫代付',
      upstreamCode: 'FastDFPay',
      paymentType: '支付宝H5',
      group: '默认分组',
      status: 1
    },
    {
      id: 10,
      channelName: '安全代付_通道10',
      channelCode: '20',
      channelRate: 0.75,
      fixedFee: 1.20,
      upstreamName: '红牛代付',
      upstreamCode: 'SafeDFPay',
      paymentType: '银行卡',
      group: '高级分组',
      status: 0
    },
    {
      id: 11,
      channelName: '极速代付_通道11',
      channelCode: '25',
      channelRate: 1.00,
      fixedFee: 2.50,
      upstreamName: 'KK备付金',
      upstreamCode: 'SpeedDFPay',
      paymentType: '银行卡',
      group: '默认分组',
      status: 1
    },
    {
      id: 12,
      channelName: '稳定代付_通道12',
      channelCode: '30',
      channelRate: 0.55,
      fixedFee: 0.90,
      upstreamName: '小草代付',
      upstreamCode: 'StableDFPay',
      paymentType: '支付宝H5',
      group: '高级分组',
      status: 1
    },
    {
      id: 13,
      channelName: '高效代付_通道13',
      channelCode: '35',
      channelRate: 0.65,
      fixedFee: 1.10,
      upstreamName: '融通代付',
      upstreamCode: 'EfficientDFPay',
      paymentType: '银行卡',
      group: '默认分组',
      status: 1
    },
    {
      id: 14,
      channelName: '智能代付_通道14',
      channelCode: '40',
      channelRate: 0.85,
      fixedFee: 1.80,
      upstreamName: '熊猫代付',
      upstreamCode: 'SmartDFPay',
      paymentType: '银行卡',
      group: '高级分组',
      status: 0
    },
    {
      id: 15,
      channelName: '专业代付_通道15',
      channelCode: '45',
      channelRate: 0.70,
      fixedFee: 1.30,
      upstreamName: '流川枫代付',
      upstreamCode: 'ProDFPay',
      paymentType: '支付宝H5',
      group: '默认分组',
      status: 1
    },
    {
      id: 16,
      channelName: '优质代付_通道16',
      channelCode: '50',
      channelRate: 0.90,
      fixedFee: 2.00,
      upstreamName: '红牛代付',
      upstreamCode: 'QualityDFPay',
      paymentType: '银行卡',
      group: '高级分组',
      status: 1
    },
    {
      id: 17,
      channelName: '标准代付_通道17',
      channelCode: '55',
      channelRate: 0.50,
      fixedFee: 0.70,
      upstreamName: 'KK备付金',
      upstreamCode: 'StandardDFPay',
      paymentType: '银行卡',
      group: '默认分组',
      status: 1
    },
    {
      id: 18,
      channelName: '精准代付_通道18',
      channelCode: '60',
      channelRate: 0.95,
      fixedFee: 2.20,
      upstreamName: '小草代付',
      upstreamCode: 'PreciseDFPay',
      paymentType: '支付宝H5',
      group: '高级分组',
      status: 0
    },
    {
      id: 19,
      channelName: '可靠代付_通道19',
      channelCode: '65',
      channelRate: 0.40,
      fixedFee: 0.60,
      upstreamName: '融通代付',
      upstreamCode: 'ReliableDFPay',
      paymentType: '银行卡',
      group: '默认分组',
      status: 1
    },
    {
      id: 20,
      channelName: '灵活代付_通道20',
      channelCode: '70',
      channelRate: 1.10,
      fixedFee: 2.80,
      upstreamName: '熊猫代付',
      upstreamCode: 'FlexibleDFPay',
      paymentType: '银行卡',
      group: '高级分组',
      status: 1
    }
  ],

  // 上游选项
  upstreamOptions: [
    { label: '代付上游A', value: '代付上游A' },
    { label: '代付上游B', value: '代付上游B' },
    { label: '代付上游C', value: '代付上游C' },
    { label: '代付上游D', value: '代付上游D' },
    { label: '代付上游E', value: '代付上游E' },
    { label: '代付上游F', value: '代付上游F' }
  ],

  // 支付类型选项
  paymentTypeOptions: [
    { label: '银行卡', value: '银行卡' },
    { label: '支付宝H5', value: '支付宝H5' }
  ],

  // 分组选项
  groupOptions: [
    { label: '默认分组', value: '默认分组' },
    { label: '高级分组', value: '高级分组' }
  ],

  // 状态选项
  statusOptions: [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 }
  ]
}