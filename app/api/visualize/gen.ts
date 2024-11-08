"use server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const baseNodeSchema = z.object({
  result: z.array(
    z
      .object({
        name: z.string(),
        value: z.array(z.string()),
        detail: z
          .string()
          .optional()
          .describe(
            "Formula or calculation used to derive this column, e.g. 'employees.salary + bonuses.amount AS total_compensation'"
          ),
      })
      .describe(
        "Represents a column in the final result set of the query, including its source columns and calculation details"
      )
  ),
  tables: z.array(
    z
      .object({
        name: z
          .string()
          .describe(
            "Name of the source table referenced in the query, e.g. 'employees', 'departments'"
          ),
        columns: z
          .array(z.string())
          .describe(
            "List of columns from this table that are used in the query result, e.g. ['employee_id', 'first_name', 'salary']"
          ),
      })
      .describe(
        "Represents a source table used in the query, listing only the columns that contribute to the final result"
      )
  ),
});

export async function getVisualizationData(sqlQuery: string, language: string) {
  const result = await generateObject({
    model: openai("gpt-4o"),
    schema: baseNodeSchema,
    prompt: `Analyze the SQL query and generate a detailed data lineage mapping that shows how columns flow from source tables to the final result set.

Requirements:
1. Result Columns Analysis:
   - For each column in the SELECT statement, identify:
     - The exact name it appears as in the result set
     - All source columns that contribute to it
     - Any transformations or calculations applied (if applicable)

2. Table Usage Analysis:
   - For each table referenced in the query:
     - List only the columns that are actually used in the result
     - Include columns used in joins or conditions that affect the result
     - Exclude columns that don't contribute to the final output

3. Special Cases:
   - For calculated fields, document the full expression
   - For aliased columns, track both original and new names
   - For aggregated fields, note the aggregation function used

Example Output Structure:
{
  "result": [
    {
      "name": "total_compensation",
      "value": ["salaries.base_salary", "salaries.bonus"],
      "detail": "salaries.base_salary + salaries.bonus"
    }
  ],
  "tables": [
    {
      "name": "salaries",
      "columns": ["base_salary", "bonus"]
    }
  ]
}

SQL Query: ${sqlQuery}
Language: ${language}

Please analyze the query and provide a complete mapping of column lineage and table usage.`,
  });

  return result.object;
}
