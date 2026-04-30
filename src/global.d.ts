export {}

declare global {
  interface Window {
    api: {
      taskList: (filters?: any) => Promise<any[]>
      taskCreate: (task: any) => Promise<any>
      taskUpdate: (id: string, updates: any) => Promise<any>
      taskDelete: (id: string) => Promise<{ success: boolean }>
      taskCalendar: (filters?: { year?: number; month?: number }) => Promise<any[]>

      categoryList: () => Promise<any[]>
      categoryCreate: (cat: any) => Promise<any>
      categoryUpdate: (id: string, updates: any) => Promise<any>
      categoryDelete: (id: string) => Promise<{ success: boolean }>

      tagList: () => Promise<any[]>
      tagCreate: (tag: any) => Promise<any>
      tagDelete: (id: string) => Promise<{ success: boolean }>
    }
  }
}
