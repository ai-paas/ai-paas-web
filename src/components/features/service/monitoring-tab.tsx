import {
  Accordion,
  LineChart,
  Select,
  type SelectSingleValue,
} from "@innogrid/ui";
import styles from "@/pages/service/service.module.scss";
import { useState } from "react";

type OptionType = { text: string; value: string };
const options1 = [
  { text: "워크플로우 전체", value: "워크플로우 전체" },
  { text: "워크플로우 1", value: "option2" },
  { text: "워크플로우 2", value: "option3" },
];
const options2 = [
  { text: "최근 1시간", value: "최근 1시간" },
  { text: "최근 1일", value: "option2" },
  { text: "최근 1주일", value: "option3" },
];

export const MonitoringTab = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<OptionType>();
  const [selectedPeriod, setSelectedPeriod] = useState<OptionType>();

  const handleSelectWorkflow = (option: SelectSingleValue<OptionType>) => {
    if (!option) return;
    setSelectedWorkflow(option);
  };

  const handleSelectPeriod = (option: SelectSingleValue<OptionType>) => {
    if (!option) return;
    setSelectedPeriod(option);
  };

  const accordionItems1 = [
    {
      label: "총 메시지 수",
      component: (
        <div className={styles.accordionContent}>
          <LineChart
            xDataKey="name"
            yDataKey={["workflow1", "workflow2"]}
            data={[
              {
                name: "2022.04.12",
                workflow1: 120,
                workflow2: 100,
              },
              {
                name: "24",
                workflow1: 162,
                workflow2: 100,
              },
              {
                name: "25",
                workflow1: 118,
                workflow2: 120,
              },
              {
                name: "26",
                workflow1: 131,
                workflow2: 89,
              },
              {
                name: "27",
                workflow1: 85,
                workflow2: 121,
              },
              {
                name: "2022.04.28",
                workflow1: 81,
                workflow2: 100,
              },
            ]}
          />
        </div>
      ),
    },
  ];
  const accordionItems2 = [
    {
      label: "활성 사용자 수",
      component: (
        <div className={styles.accordionContent}>
          <LineChart
            xDataKey="name"
            yDataKey={["workflow1", "workflow2"]}
            data={[
              {
                name: "2022.04.12",
                workflow1: 120,
                workflow2: 100,
              },
              {
                name: "24",
                workflow1: 162,
                workflow2: 100,
              },
              {
                name: "25",
                workflow1: 118,
                workflow2: 120,
              },
              {
                name: "26",
                workflow1: 131,
                workflow2: 89,
              },
              {
                name: "27",
                workflow1: 85,
                workflow2: 121,
              },
              {
                name: "2022.04.28",
                workflow1: 81,
                workflow2: 100,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="tabs-Content">
      <div className={styles.selectBox}>
        <Select
          options={options1}
          getOptionLabel={(option) => option.text}
          getOptionValue={(option) => option.value}
          value={selectedWorkflow}
          onChange={handleSelectWorkflow}
          menuPosition="fixed"
          size="m-small"
        />
        <Select
          options={options2}
          getOptionLabel={(option) => option.text}
          getOptionValue={(option) => option.value}
          value={selectedPeriod}
          onChange={handleSelectPeriod}
          menuPosition="fixed"
          size="m-small"
        />
      </div>
      <div className={styles.accordionBox}>
        <Accordion className={styles.accordion} components={accordionItems1} />
        <Accordion className={styles.accordion} components={accordionItems2} />
      </div>
    </div>
  );
};
