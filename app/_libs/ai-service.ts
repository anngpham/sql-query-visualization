"use server";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// Visualize column impact and data lineage to track columns across transformations by analyzing SQL query.

const userInput = `
        SELECT 
            o.order_id,
            o.order_date,
            o.quantity,
            o.total_price,
            p.product_id,
            p.product_name,
            p.price AS product_price,
            s.shipment_id,
            s.shipment_date,
            s.status AS shipment_status
        FROM 
            orders o
        JOIN 
            products p ON o.product_id = p.product_id
        JOIN 
            shipments s ON o.shipment_id = s.shipment_id
        ORDER BY 
            o.order_date DESC;
        `;

const userInput2 = `
    SELECT e.employee_id, e.first_name, e.last_name, d.department_name, p.project_name, e.salary
    FROM employees e
    JOIN departments d ON e.department_id = d.department_id
    JOIN projects p ON e.employee_id = p.employee_id
    WHERE d.department_name = 'Sales'
    ORDER BY e.salary DESC;
`;

const userInput3 = `
    SELECT 
        e.employee_id,
        e.first_name,
        e.last_name,
        d.department_name,
        p.project_name,
        ep.role,
        s.base_salary + s.bonus AS total_compensation
    FROM 
        employees e
    JOIN 
        departments d ON e.department_id = d.department_id
    JOIN 
        employee_projects ep ON e.employee_id = ep.employee_id
    JOIN 
        projects p ON ep.project_id = p.project_id
    JOIN 
        salaries s ON e.employee_id = s.employee_id
    WHERE 
        d.department_name = 'Engineering'
    ORDER BY 
        total_compensation DESC;
    `;

const language = "postgresql";

export async function getVisualizationData(sqlQuery: string, language: string) {
  const baseNodeSchema = z.object({
    id: z
      .string()
      // .default(() => uuidv4())
      .describe("Id of node, format UUIDv4"),
    data: z.object({
      label: z
        .string()
        .describe(
          "With table label is label name, with property label is column name. With result table label is result"
        ),
    }),
  });

  type Node = z.infer<typeof baseNodeSchema> & {
    children: Node[];
  };

  const nodeSchema: z.ZodType<Node> = baseNodeSchema.extend({
    children: z
      .lazy(() => nodeSchema.array())
      .describe(
        "Children of node are columns of table and table result, with property label is column name. If don't have children, return empty array"
      ),
  });

  const result = await generateObject({
    model: openai("gpt-4o"),
    schema: z.object({
      nodes: z.array(nodeSchema),

      edges: z.array(
        z.object({
          id: z
            .string()
            .default(() => uuidv4())
            .describe("Id of edge, format UUIDv4"),
          source: z
            .string()
            .describe("Id of source node which have connects to target node"),
          target: z
            .string()
            .describe("Id of target node which open connect from source node"),
        })
      ),
    }),
    prompt: `Analyze the SQL SELECT query and map the data lineage by generating nodes and edges for visualization using ReactFlow. Each table and its columns should be represented as nodes, with connections (edges) showing relationships from source columns to target columns in the query result.

    Requirements:
      - Only create nodes for fields that are directly selected in the result set. For example, if a field from table 'orders' is not explicitly selected in the result, it should not have a node.
      - Identify each table as a node, using the table name as the label (e.g., 'orders', 'products', 'shipments'). Additionally, create a node labeled 'Result' to represent the final output of the query.
      - For each column in a table and result table, create a node with the column name as the label. Add it as a child of parent (e.g., the order_id column has be a child of orders node).
      - Set edges to show data flow from the columns in source tables to the corresponding columns in the result node. For example:
          - **Source**: Use the ID of a column node in the source table (e.g., id of node orders.order_id).
          - **Target**: Use the ID of the corresponding column node in the Result node (e.g., id of node Result.order_id).
       - **Important**: Each node ID and edge ID **must** follow UUIDv4 format. Use the uuidv4() function to generate each node ID and edge ID, as well as the source and target IDs. Make sure every ID strictly adheres to the UUIDv4 format.
    
    Input SQL Query: ${sqlQuery}
    Language: ${language}
    
    Output format: Return JSON data with "nodes" and "edges" arrays for visualization using ReactFlow, where:
      - "nodes" include tables and columns with their labels and children.
      - "edges" include source-target pairs to represent data flow and column dependencies.`,
  });

  console.log(JSON.stringify(result.object, null, 2));

  console.log();
  console.log("Token usage:", result.usage);
  return result.object;
}
