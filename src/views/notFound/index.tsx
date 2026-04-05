import { type FC } from "react";
import { Result, Button, Typography, Space } from "antd";
import { HomeOutlined, RollbackOutlined } from "@ant-design/icons";
import classNames from "classnames/bind";
import style from "./index.module.scss";

const cx = classNames.bind(style);
const { Paragraph, Title } = Typography;

const Funny404: FC = () => {
  return (
    <div className={cx("container")}>
      <Result
        status="404"
        title={
          <Title className={cx("title")} level={2}>
            哎呀！页面不见了
          </Title>
        }
        subTitle={
          <Paragraph className={cx("sub")}>
            可能是路由走丢了，也可能是页面偷偷溜去度假。
          </Paragraph>
        }
        extra={
          <>
            <Space className={cx("buttonRow")}>
              <Button
                type="primary"
                icon={<HomeOutlined />}
                onClick={() => (window.location.href = "/")}
              >
                回到首页
              </Button>

              <Button
                icon={<RollbackOutlined />}
                onClick={() => window.history.back()}
              >
                返回上一页
              </Button>
            </Space>
          </>
        }
      />

      <div className={cx("footer")}>
        如果你是开发者：检查路由、静态资源和后端接口。别把 console.log
        当成魔法。
      </div>
    </div>
  );
};

export default Funny404;
