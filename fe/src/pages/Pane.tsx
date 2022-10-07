import { Button, Card, InputNumber } from "antd";
import { useEffect, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";

enum ReadyState {
  UNINSTANTIATED = -1,
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

const ReadyStateMapper = {
  [ReadyState.UNINSTANTIATED]: (
    <span style={{ color: "red" }}>未知异常</span>
  ),
  [ReadyState.CONNECTING]: <span style={{ color: "orange" }}>️正在连接</span>,
  [ReadyState.OPEN]: <span style={{ color: "green" }}>已连接</span>,
  [ReadyState.CLOSING]: "关闭中",
  [ReadyState.CLOSED]: <span style={{ color: "grey" }}>已关闭</span>,
};

export const Pane = () => {
  const [lastIndex, setLastIndex] = useState(1);
  const [clients, setClients] = useState([0]);
  return (
    <>
      {clients.map((c) => {
        if (c === 0) return <ClientHolder index={c} key={c} />;
        return (
          <ClientHolder
            key={c}
            droppable
            index={c}
            onDrop={() =>
              setClients((cs) => {
                const idx = cs.findIndex((i) => i === c);
                cs.splice(idx, 1);
                return [...cs];
              })
            }
          />
        );
      })}
      <Button
        onClick={() => {
          setClients((cs) => [...cs, lastIndex]);
          setLastIndex((prev) => prev + 1);
        }}
      >
        +
      </Button>
    </>
  );
};

const ClientHolder: React.FC<{
  onDrop?: (idx: number) => void;
  droppable?: boolean;
  index: number;
}> = ({ onDrop = () => {}, droppable = false, index }) => {
  return (
    <Card style={{ marginTop: 18, position: "relative", width: 480 }}>
      <PaneClient index={index} key={index} />
      {droppable ? (
        <Button
          style={{ position: "absolute", top: 0, right: 0 }}
          onClick={() => onDrop(index)}
        >
          -
        </Button>
      ) : null}
    </Card>
  );
};

export const PaneClient: React.FC<{ index: number }> = ({ index }) => {
  const { sendMessage, readyState, lastMessage } = useWebSocket(
    "ws://f.abiao.me:3000/ws"
  );
  const [speed, setSpeed] = useState(5);
  const [isStop, setIsStop] = useState(false);

  useEffect(() => {
    const it = setInterval(() => {
      if (isStop) {
        sendMessage(new Int8Array(new ArrayBuffer(0)).fill(0));
        return;
      }
      sendMessage(new Int8Array(new ArrayBuffer(speed * 1024 * 1024)).fill(0));
    }, 1000);
    return () => {
      clearInterval(it);
    };
  }, [lastMessage, sendMessage, readyState, isStop]);

  const StateButton = () => {
    const onClickButton = () => {
      setIsStop((prev) => !prev);
    };
    return <Button onClick={onClickButton}>{isStop ? "开始" : "暂停"}</Button>;
  };
  return (
    <>
      <section>
        <h3>客户端{index + 1}:</h3>
        <p>
          <strong>状态：</strong>
          {ReadyStateMapper[readyState] || "状态异常"}
        </p>
        <p>
          <strong>
            收包字节数: {((lastMessage?.data?.size ?? 0) / 1024).toFixed(2)} KB / s
          </strong>
        </p>
      </section>
      <section>
        <strong>速度：</strong>
        <InputNumber
          addonAfter="M/s"
          value={speed}
          max={10}
          min={0}
          onChange={(n: any) => {
            if (!n) {
              setSpeed(0);
              return;
            }
            if(Number.isFinite(Number(n))) {
              setSpeed(Number(n))
            }
          }}
        />
        <p style={{fontSize: 12, color: 'grey'}}>
          数据限制0-10M，由于数据包从客户端生成，具体上传速率受限于客户端带宽
        </p>
      </section>
      <section>
        <strong>控制：</strong>
        <StateButton />
      </section>
    </>
  );
};
