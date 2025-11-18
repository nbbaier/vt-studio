"use client";

import { useState } from "react";
import Block from "@/components/orbit/block";
import Inset from "@/components/orbit/inset";
import Section from "@/components/orbit/section";
import { Select } from "@/components/orbit/select";

const dbs = [
  { value: "SQLite", label: "SQLite" },
  { value: "Val Town SQLite", label: "Val Town SQLite" },
];

export default function SelectStorybook() {
  const [value, setValue] = useState(dbs[0].value);

  return (
    <Section>
      <Inset>
        <Block title="Select">
          <Select
            options={dbs}
            setValue={(value) => setValue(value)}
            value={value}
            size="sm"
          />
          <Select
            options={dbs}
            setValue={(value) => setValue(value)}
            value={value}
            size="base"
          />
          <Select
            options={dbs}
            setValue={(value) => setValue(value)}
            value={value}
            size="lg"
          />
        </Block>
      </Inset>
    </Section>
  );
}
