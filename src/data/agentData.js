// 代理商列表模拟数据
export const agentList = [
  {
    agentId: '1',
    username: 'agent_01',
    agentName: '代理商A',
    parentAgent: '-',
    subAccountCount: 3,
    merchantCount: 12,
    balance: '50000.00',
    availableBalance: '48000.00',
    frozenBalance: '2000.00',
    rate: '1.2%',
    lastLoginIp: '192.168.1.101',
    loginCount: 156,
    googleAuth: true,
    oneClickLogin: true,
    role: '总代理',
    status: 'active'
  },
  {
    agentId: '2',
    username: 'agent_02',
    agentName: '代理商B',
    parentAgent: '代理商A',
    subAccountCount: 0,
    merchantCount: 5,
    balance: '12000.00',
    availableBalance: '12000.00',
    frozenBalance: '0.00',
    rate: '1.5%',
    lastLoginIp: '192.168.1.102',
    loginCount: 45,
    googleAuth: false,
    oneClickLogin: false,
    role: '普通代理',
    status: 'active'
  }
]
