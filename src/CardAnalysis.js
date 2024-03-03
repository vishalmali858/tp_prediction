import {
  generateCardsDataAutomation,
  getCoditionOfPlayerBAtStep5,
  getDataSourceForStep5,
  getPredictionData,
} from "./helper";
import logs from "./log_1.json";
import {
  Card,
  Typography,
  Table,
  Space,
  Image,
  Flex,
  Row,
  Col,
  Collapse,
} from "antd";
import PieChart from "./PieChart";
import LiquidPlot from "./LiquidPlot";

function CardsAnalysis({ currentData }) {
  const columns = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
    },
    {
      title: "Result",
      key: "result",
      dataIndex: "result",
    },
    {
      title: "Priority",
      key: "priority",
      dataIndex: "priority",
    },
  ];

  const matchedDataColumns = [
    {
      title: "Priority name",
      key: "priorityName",
      dataIndex: "priorityName",
    },
    {
      title: "Card name",
      key: "nameArray",
      dataIndex: "nameArray",
      render: (record) => <RenderCards cardArray={record} />,
    },
  ];

  const step5columns = [
    {
      title: "Name",
      key: "name",
      dataIndex: "name",
      render: (record) => {
        return <RenderCards cardArray={[record]} />;
      },
    },
    {
      title: "Result",
      key: "result",
      dataIndex: "result",
    },
    {
      title: "Priority",
      key: "priority",
      dataIndex: "priority",
    },
  ];

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

  const dataInItem = currentData?.length ? currentData : logs;
  const collapsableItem = dataInItem.map(
    ({ creationDate, formValues, playerDataA, playerDataB }, i) => {
      const { winSwitch, comments, playerASelect, playerBSelect } = formValues;
      const { priortyWiseHit, dataForColumns } = getCoditionOfPlayerBAtStep5({
        playerDataA,
        playerDataB,
        playerASelect,
        playerBSelect,
      });

      const predictionbject = getPredictionData({ priortyWiseHit });
      const winProbaility = Math.round(
        (dataForColumns.length / priortyWiseHit.prediction.count) * 100
      );

      const dataReset = !(playerASelect?.length || playerBSelect?.length);
      return {
        key: `${i + 1}_panel`,
        label: (
          <Flex justify={"space-between"}>
            <div>{`Analysis of Hand ${i + 1}`}</div>
            <div>{new Date(creationDate).toLocaleString()}</div>
          </Flex>
        ),
        children: (
          <Card>
            <Row>
              <Col span={12}>
                <Table
                  columns={columns}
                  dataSource={
                    dataReset
                      ? []
                      : getDataSourceForStep5({
                          playerASelect,
                          playerDataA,
                          playerDataB,
                          playerBSelect,
                        })
                  }
                  bordered
                  title={() => (
                    <>
                      Step 5 (Player A)
                      <RenderCards cardArray={playerASelect} />
                    </>
                  )}
                  pagination={false}
                />
                <Card>
                  <Row>
                    <PieChart data={predictionbject.pieChartData} />
                  </Row>
                </Card>
              </Col>
              <Col span={12}>
                <Table
                  columns={step5columns}
                  dataSource={dataReset ? [] : dataForColumns}
                  bordered
                  title={() => (
                    <>
                      Step 5 (Player B)
                      <RenderCards
                        cardArray={[
                          playerBSelect?.[0] || undefined,
                          playerBSelect?.[1] || undefined,
                        ]}
                      />
                      <Typography>
                        {`Player A Win Probability: ${100 - winProbaility} %`}
                        <br />
                        {`Player B Win Probability: ${winProbaility} %`}
                        <br />
                        {`Total (${dataForColumns.length}/47) suggested cards by the algorithm`}
                      </Typography>
                    </>
                  )}
                  pagination={false}
                />
              </Col>
            </Row>
            <Space />
            <RenderCards cardArray={playerBSelect} />
            <Typography>{`Player ${winSwitch ? "A" : "B"} wins`}</Typography>
            {!!comments ? (
              <Typography>{`Comments: ${comments}`}</Typography>
            ) : null}
          </Card>
        ),
      };
    }
  );

  const {
    automationObj: { matchedData },
  } = generateCardsDataAutomation();
  return (
    <>
      {/* <Table
        columns={matchedDataColumns}
        dataSource={matchedData}
        expandable={{
          expandedRowRender: (record) => {
            return (
              <>
                <Table
                  columns={[
                    ...matchedDataColumns,
                    {
                      title: "Comparison Card name",
                      key: "nameArray",
                      dataIndex: "nameArray",
                      render: () => <RenderCards cardArray={record} />,
                    },
                  ]}
                  dataSource={matchedData}
                />
              </>
            );
          },
          rowExpandable: () => true,
        }}
      /> */}
      <Collapse
        defaultActiveKey={"1_panel"}
        accordion={true}
        items={collapsableItem}
      />
    </>
  );
}

export default CardsAnalysis;
