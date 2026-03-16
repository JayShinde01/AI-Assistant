/**
 * components/ModelSelector.jsx
 * ----------------------------
 * Dropdown for choosing an AI model, grouped by model family.
 *
 * Uses Ant Design's Select with OptGroup so the 30+ models are
 * organized into readable sections (Gemini 2.5, Gemini 2.0, etc.)
 *
 * Props:
 *   value    {string}   - Currently selected model value
 *   onChange {Function} - Called with the new model value on change
 *   disabled {boolean}  - Disable the selector (e.g. while loading)
 */

import React from "react";
import { Select, Tag, Space, Typography } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import { AI_MODELS_GROUPED } from "../constants/models";

const { OptGroup, Option } = Select;
const { Text } = Typography;

function ModelSelector({ value, onChange, disabled = false }) {
  return (
    <Select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{ width: "100%" }}
      optionLabelProp="label"
      showSearch
      filterOption={(input, option) =>
        // Allow searching by model label
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      placeholder="Select a model"
      aria-label="Select AI model"
      // Limit dropdown height so it doesn't overflow the screen
      listHeight={320}
    >
      {Object.entries(AI_MODELS_GROUPED).map(([groupName, models]) => (
        <OptGroup key={groupName} label={groupName}>
          {models.map((model) => (
            <Option
              key={model.value}
              value={model.value}
              label={model.label}   // shown in the trigger after selection
            >
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
                <Space size={6}>
                  <RobotOutlined style={{ color: "#888", fontSize: 12 }} />
                  <Text style={{ fontSize: 13 }}>{model.label}</Text>
                </Space>
                <Tag
                  color={model.badgeColor}
                  style={{ fontSize: 10, margin: 0, lineHeight: "16px" }}
                >
                  {model.badge}
                </Tag>
              </Space>
            </Option>
          ))}
        </OptGroup>
      ))}
    </Select>
  );
}

export default ModelSelector;
