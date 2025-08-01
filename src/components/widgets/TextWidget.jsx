"use client"
import { FileText } from "lucide-react"

const TextWidget = ({ content, fontSize = "md", ...props }) => {
  const fontSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  }

  // Simple markdown-like parsing
  const parseContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^# (.*$)/gim, "<h1 class='text-2xl font-bold mb-4'>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2 class='text-xl font-bold mb-3'>$1</h2>")
      .replace(/^### (.*$)/gim, "<h3 class='text-lg font-bold mb-2'>$1</h3>")
      .replace(/\n/g, "<br>")
  }

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-4">
        <FileText className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-500">Text Widget</span>
      </div>
      <div
        className={`prose prose-sm max-w-none ${fontSizeClasses[fontSize]} text-gray-900`}
        dangerouslySetInnerHTML={{ __html: parseContent(content) }}
      />
    </div>
  )
}

export default TextWidget
