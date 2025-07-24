# PMP代收订单对接文档

## 1. 概述

### 1.1 功能描述

为商户提供 WEB 支付接入解决方案。

### 1.2 阅读对象

本文档面向具有一定WEB网页开发能力，了解基本接口开发和项目管理人员。

### 1.3 回调 IP 白名单

联系客服获取

### 1.4 API Key 秘钥

联系客服获取

### 1.5 网关域名

联系客服获取

### 1.6 签名算法

1. 筛选：获取所有不为空的请求参数。
2. 排序：将筛选的参数按 ASCII 升序排列。
3. 拼接：参数=参数值，用 & 连接。
4. 添加秘钥：将商户秘钥以 key=value 拼接到参数串末尾。
5. 签名：MD5 加密后转大写，作为 sign 传入。

## 2. 接口

### 2.1 创建代收支付订单

**请求 URL**

```
https://网关域名/api/pay
```

**请求方式**

POST

**请求参数示例**

```json
{
  "order_sn": "order000000000003",
  "order_amount": 100.2,
  "notify_url": "https://支付回调地址",
  "code": "0000",
  "merchant_no": "M250625163647438000003",
  "sign": "3FD4C54995CD85C18B3F785018FA48BF"
}
```

**字段说明**

| 字段名 | 必选 | 类型 | 说明 |
| --- | --- | --- | --- |
| order_sn | 是 | string | 商户订单号 |
| order_amount | 是 | float | 订单金额 |
| notify_url | 是 | string | 回调地址 |
| code | 是 | string | 产品编码 |
| merchant_no | 是 | string | 商户号 |
| sign | 是 | string | 签名 |

**成功返回示例**

```json
{
  "trace_id": "05a5826860331fc7c825e5cd70e62826",
  "status": true,
  "code": 2000,
  "msg": "success",
  "data": {
    "order_sn": "order000000000003",
    "trade_num": "20250721161145N45XB3NS00000000000002",
    "pay_url": "https://www.xxxxxxx.xx"
  }
}
```

**返回字段说明**

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| trace_id | string | 服务追踪 id |
| status | string | true 表成功 |
| code | string | 2000 为成功 |
| msg | string | 成功或失败原因 |
| data | object | 包含订单信息 |
| order_sn | string | 商户订单号 |
| trade_num | string | 渠道订单号 |
| pay_url | string | 支付链接 |

### 2.2 查询代收订单

**请求 URL**

```
https://网关域名/api/query_pay
```

**请求方式**

POST

**请求参数示例**

```json
{
  "trade_num": "20250721161145N45XB3NS00000000000002",
  "order_sn": "order000000000003",
  "merchant_no": "M250625163647438000003",
  "sign": "7F9E65B95351CC235CA6DD50323DC84E"
}
```

**字段说明**

| 字段名 | 必选 | 类型 | 说明 |
| --- | --- | --- | --- |
| trade_num | 是 | string | 渠道订单号 |
| order_sn | 是 | string | 商户订单号 |
| merchant_no | 是 | string | 商户号 |
| sign | 是 | string | 签名 |

**成功返回示例**

```json
{
  "trace_id": "a56e9aa568eda7468729dcd180052c31",
  "status": true,
  "code": 2000,
  "msg": "success",
  "data": {
    "order_amount": "100.2",
    "order_status": "2",
    "trade_num": "20250721161145N45XB3NS00000000000002"
  }
}
```

**返回字段说明**

| 字段名 | 类型 | 说明 |
| --- | --- | --- |
| order_amount | string | 订单金额 |
| order_status | string | 订单状态：<br>0:订单创建<br>1:交易成功<br>2:待付款<br>3:交易中<br>4:交易失败<br>5:申诉中<br>6:拉单失败<br>7:交易撤销<br>8:补单成功 |
| trade_num | string | 渠道订单号 |

## 3. 支付结果回调

**描述**

当订单状态为 1（交易成功）或 8（补单成功）时，系统会回调 notify_url，成功回调只推送一次，失败会重试三次。不论状态是否成功，必须返回 `SUCCESS`。

**请求方式**

POST

**请求参数示例**

```json
{
  "order_sn": "oid123456789",
  "order_amount": 100,
  "order_status": "1",
  "trade_num": "20250721161145N45XB3NS00000000000002",
  "sign": "2833EDF9AFA23A284B9BAF29074487A5"
}
```

**字段说明**

| 字段名 | 类型 | 必选 | 说明 |
| --- | --- | --- | --- |
| order_sn | string | 是 | 商户订单号 |
| order_amount | float | 是 | 订单金额 |
| order_status | string | 是 | 同上订单状态 |
| trade_num | string | 是 | 供应商订单号 |
| sign | string | 是 | 签名 |

## 4. 错误码说明

| 错误码 | 错误信息 | 说明 |
| --- | --- | --- |
| 2000 | success | 请求成功 |
| 4000 | parameter error | 参数错误 |
| 4001 | sign error | 签名错误 |
| 4002 | merchant not exist | 商户不存在 |
| 4003 | merchant disabled | 商户已禁用 |
| 5000 | system error | 系统错误 |

## 5. 联系我们

如有任何问题，请通过以下方式联系我们：

- 技术支持邮箱：support@example.com
- 技术支持电话：400-123-4567（工作日 9:00-18:00）
- 在线客服：登录商户后台，点击右下角"在线客服"按钮