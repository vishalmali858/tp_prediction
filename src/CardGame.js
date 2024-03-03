import {
  Typography,
  Select,
  Button,
  Card,
  Form,
  Input,
  Space,
  Switch,
  Col,
  Row,
  Image,
} from "antd";
import {
  generateCardsData,
  getCardsOptions,
  generateWinningConditionsArray,
} from "./helper";
import { useState } from "react";
import CardsAnalysis from "./CardAnalysis";

function CardGame() {
  const { TextArea } = Input;
  const [form] = Form.useForm();

  const currentCards = generateCardsData();
  const [selectedCardsA, setSelectedCardsA] = useState([]);
  const [selectedCardsB, setSelectedCardsB] = useState([]);

  async function handleFormFinish(formValues) {
    try {
      const dataToSent = JSON.stringify({
        creationDate: new Date(),
        formValues,
        playerDataA: {
          cards: selectedCardsA,
          data: generateWinningConditionsArray({
            currentCard: selectedCardsA,
          }),
        },
        playerDataB: {
          cards: selectedCardsB,
          data: generateWinningConditionsArray({
            currentCard: selectedCardsB,
          }),
        },
      });
      var dataStr =
        "data:text/json;charset=utf-8," + encodeURIComponent(dataToSent);
      var downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `log_${new Date()}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      resetScreen();
    } catch (e) {
      console.log(e);
    }
  }

  function resetScreen() {
    form.resetFields();
    setSelectedCardsA([]);
    setSelectedCardsB([]);
  }

  const RenderCards = ({ cardArray }) => {
    return cardArray
      ?.filter((cardIndex) => cardIndex)
      .map((cardIndex) => {
        return (
          <Image
            preview={false}
            src={require(`./img/${cardIndex}.png`)}
            width={60}
            height={60}
          />
        );
      });
  };

  return (
    <Card>
      <Form
        form={form}
        layout={"vertical"}
        onFinish={handleFormFinish}
        initialValues={{
          winSwitch: "checked",
          comments: "",
          playerASelect: [],
          playerBSelect: [],
        }}
      >
        <Row>
          <Col span={24}>
            <Row>
              <Col span={8}>
                <Typography.Title>Player A</Typography.Title>
                <Form.Item
                  label={"Select 3 cards from the list"}
                  rules={[
                    { required: true },
                    { type: "array", max: 3, min: 3 },
                  ]}
                  name="playerASelect"
                >
                  <Select
                    mode="multiple"
                    style={{ width: "100%" }}
                    options={getCardsOptions({
                      currentCards,
                      selectedCardsA: [],
                      selectedCardsB,
                    })}
                    onChange={(value, valArr) => {
                      setSelectedCardsA([...valArr]);
                    }}
                    maxCount={3}
                  />
                </Form.Item>
                <Row>
                  <RenderCards
                    cardArray={form.getFieldValue("playerASelect")}
                  />
                </Row>
                <br />
              </Col>
              <Col span={8}>
                <Row justify={"center"}>
                  <Form.Item name="winSwitch" rules={[{ required: true }]}>
                    <Switch
                      checkedChildren={"A Wins"}
                      unCheckedChildren={"B Wins"}
                    />
                  </Form.Item>
                </Row>
                <Row justify={"center"}>
                  <Space>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Complete
                      </Button>
                    </Form.Item>
                    <Form.Item>
                      <Button
                        type="primary"
                        danger
                        htmlType="reset"
                        onClick={resetScreen}
                      >
                        Reset
                      </Button>
                    </Form.Item>
                  </Space>
                </Row>
              </Col>
              <Col span={8}>
                <Typography.Title>Player B</Typography.Title>
                <Form.Item
                  label={"Select 3 cards from the list"}
                  rules={[{ required: true }]}
                  name="playerBSelect"
                >
                  <Select
                    mode="multiple"
                    style={{ width: "100%" }}
                    options={getCardsOptions({
                      currentCards,
                      selectedCardsA,
                      selectedCardsB: [],
                    })}
                    onChange={(value, valArr) => {
                      setSelectedCardsB([...valArr]);
                    }}
                    maxCount={3}
                  />
                </Form.Item>
                <Row>
                  <RenderCards
                    cardArray={form.getFieldValue("playerBSelect")}
                  />
                </Row>
                <br />
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            {selectedCardsA.length + selectedCardsB.length >= 4 ? (
              <CardsAnalysis
                currentData={[
                  {
                    creationDate: new Date(),
                    formValues: {
                      playerASelect: form.getFieldValue("playerASelect"),
                      playerBSelect: form.getFieldValue("playerBSelect"),
                      winSwitch: form.getFieldValue("winSwitch"),
                      comments: form.getFieldValue("comments"),
                    },
                    playerDataA: {
                      cards: selectedCardsA,
                      data: generateWinningConditionsArray({
                        currentCard: selectedCardsA,
                      }),
                    },
                    playerDataB: {
                      cards: selectedCardsB,
                      data: generateWinningConditionsArray({
                        currentCard: selectedCardsB,
                      }),
                    },
                  },
                ]}
              />
            ) : null}
          </Col>
        </Row>
        <Form.Item label={"Comments"} name="comments">
          <TextArea rows={4} style={{ height: 60, resize: "none" }} />
        </Form.Item>
        <br />
      </Form>
    </Card>
  );
}

export default CardGame;
