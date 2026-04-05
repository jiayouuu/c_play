import { useMemo, useState, type FC, useEffect } from "react";
import { Button, Card, Form, Input, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import classNames from "classnames/bind";
import type { IMessage } from "@stomp/rx-stomp";
import { websocketService } from "@/utils/websocket.singleton";
import { useWebSocketStatus } from "@/hooks/useWebSocketStatus";
import { message } from "@/bridges/messageBridge";
import styles from "./index.module.scss";

const cx = classNames.bind(styles);

interface WsPayload {
  type?: string;
  sender?: string;
  message?: string;
  timestamp?: string;
}

interface LogEntry {
  id: number;
  from: string;
  payload: WsPayload;
  raw: string;
  time: string;
}

const statusColorMap: Record<string, string> = {
  idle: "default",
  connecting: "processing",
  connected: "success",
  reconnecting: "warning",
  disconnecting: "processing",
  disconnected: "default",
  reconnect_failed: "error",
};

const WebSocketView: FC = () => {
  const [form] = Form.useForm<{ message: string }>();
  const status = useWebSocketStatus();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const pushLog = (from: string, msg: IMessage) => {
    const body = msg.body;
    let payload: WsPayload = {};
    try {
      payload = JSON.parse(body) as WsPayload;
    } catch {
      payload = { message: body };
    }

    setLogs((prev) => {
      const next = [
        ...prev,
        {
          id: Date.now() + Math.random(),
          from,
          payload,
          raw: body,
          time: dayjs().format("HH:mm:ss"),
        },
      ];
      return next.slice(-200);
    });
  };

  useEffect(() => {
    let broadcastAbort: AbortController | undefined;
    let tickAbort: AbortController | undefined;
    let privateAbort: AbortController | undefined;

    const init = async () => {
      broadcastAbort = websocketService.subscribe({
        destination: "/topic/ws/broadcast",
        callback: (msg) => pushLog("broadcast", msg),
      });

      tickAbort = websocketService.subscribe({
        destination: "/topic/ws/tick",
        callback: (msg) => pushLog("tick", msg),
      });

      privateAbort = websocketService.subscribe({
        destination: "/user/queue/ws/private",
        callback: (msg) => pushLog("private", msg),
      });
    };

    void init();

    return () => {
      broadcastAbort?.abort();
      tickAbort?.abort();
      privateAbort?.abort();
    };
  }, []);

  const phaseText = useMemo(
    () => status.phase.replaceAll("_", " "),
    [status.phase],
  );

  const handleConnect = async () => {
    try {
      await websocketService.connect();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "连接失败";
      message.error(errMsg);
    }
  };

  const handleDisconnect = async () => {
    await websocketService.disconnect();
  };

  const handleSend = async () => {
    const values = await form.validateFields();
    websocketService.send("/app/ws/echo", {
      message: values.message,
    });
    form.resetFields();
  };

  const handleSendPrivate = async () => {
    const values = await form.validateFields();
    websocketService.send("/app/ws/private", {
      message: values.message,
    });
    form.resetFields();
  };

  return (
    <div className={cx("page")}>
      <Card title="WebSocket 连接状态">
        <div className={cx("status")}>
          <Tag color={statusColorMap[status.phase]}>{phaseText}</Tag>
          <Typography.Text type="secondary">
            重连次数: {status.attempts}/{status.maxReconnectAttempts}
          </Typography.Text>
          <Typography.Text type="secondary">
            最近更新时间:{" "}
            {dayjs(status.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
          </Typography.Text>
          {status.lastError ? (
            <Typography.Text type="danger">
              错误: {status.lastError}
            </Typography.Text>
          ) : null}
        </div>
        <Space style={{ marginTop: 12 }}>
          <Button type="primary" onClick={handleConnect}>
            手动连接
          </Button>
          <Button onClick={handleDisconnect}>断开连接</Button>
          <Button onClick={() => setLogs([])}>清空消息</Button>
        </Space>
      </Card>

      <Card title="发送消息到 /app/ws/echo">
        <Form
          form={form}
          layout="inline"
          initialValues={{ message: "hello websocket" }}
        >
          <Form.Item
            name="message"
            style={{ flex: 1, minWidth: 280 }}
            rules={[{ required: true, message: "请输入消息" }]}
          >
            <Input placeholder="输入要发送的内容" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={handleSend}
              disabled={status.phase !== "connected"}
            >
              广播发送
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              onClick={handleSendPrivate}
              disabled={status.phase !== "connected"}
            >
              私信自己
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="消息流（broadcast + tick + private）">
        <div className={cx("logPanel")}>
          {logs.length === 0 ? (
            <p className={cx("muted")}>暂无消息，等待服务器推送...</p>
          ) : (
            logs.map((item) => (
              <p key={item.id} className={cx("logItem")}>
                [{item.time}] [{item.from}]{" "}
                {item.payload.sender ? `${item.payload.sender}: ` : ""}
                {item.payload.message || item.raw}
                {item.payload.timestamp ? ` (${item.payload.timestamp})` : ""}
              </p>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default WebSocketView;
