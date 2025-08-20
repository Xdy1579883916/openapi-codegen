interface Opt {
  doc_url: string
}

type ApiPaths = Record<string, {
  get?: any
  post?: any
  put?: any
  delete?: any
}>

interface ResInfo {
  summary: string
  api_path: string
  methodName: string
  type_params: Array<{
    type: string
    description?: string
  }>
}

/**
 * 根据openapi接口文档生成ts类型定义
 * @param opt
 */
export async function openapi_codegen(opt: Opt): Promise<string> {
  const { doc_url } = opt
  const doc: any = await fetch(doc_url).then(res => res.json())

  const { paths } = doc || {}
  const path_entries = Object.entries(paths as ApiPaths)
  const api_list: ResInfo[] = []

  for (const [api_path, methods] of path_entries) {
    const method_entries = Object.entries(methods)
    for (const [method, method_config] of method_entries) {
      const { parameters, summary, requestBody } = method_config
      const methodName = method.toUpperCase()
      const requestBodyParams = Object.entries(requestBody?.content?.['application/json']?.schema?.properties || {})
        .map(([k, v]: [string, any]) => {
          return {
            name: k,
            description: v.description,
            schema: {
              type: v.type,
            },
          }
        })

      const type_params = [...(parameters || []), ...(requestBodyParams || [])]
        .map((param: any) => {
          const { name, required, schema, description } = param
          const is_required = required ? '' : '?'
          return {
            type: `"${name}"${is_required}: ${get_schema_type(schema?.type)}`,
            description,
          }
        })
      api_list.push({
        summary,
        api_path,
        methodName,
        type_params,
      })
    }
  }

  // to ts code
  const ts_code = api_list.map((item) => {
    const { summary, api_path, methodName, type_params } = item
    const type_params_tmp = type_params
      .map((v) => {
        const desc = `/* ${v.description || 'unset description'} */`
        return `
    ${desc}
    ${v.type}`
      })
      .join('')
    const type_params_str
        = type_params_tmp
          ? `{${type_params_tmp}
  }`
          : 'any'

    return `
  /* ${summary} */
  "${api_path}|${methodName}": ${type_params_str}`
  }).join('')
  return `/* eslint-disable */\nexport interface OpenApi {${ts_code}\n}`
}

// parameters 的 schema type 映射
const schema_type_map = {
  integer: 'number',
  long: 'number',
  number: 'number',
  string: 'string',
  boolean: 'boolean',
  object: 'any',
  array: 'Array<any>',
} as const

function get_schema_type(type: any): 'string' | 'number' | 'boolean' | 'any' | 'Array<any>' {
  if (!type) {
    return 'any'
  }
  return schema_type_map[type as keyof typeof schema_type_map] || 'any'
}
