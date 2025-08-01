"use client"
import { ImageIcon } from "lucide-react"

const ImageWidget = ({ src, alt, caption, ...props }) => {
  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 p-4 flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <ImageIcon className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-500">Image Widget</span>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
          <img src={src || "/placeholder.svg"} alt={alt} className="max-w-full max-h-full object-contain" />
        </div>
        {caption && <p className="text-sm text-gray-600 text-center mt-2">{caption}</p>}
      </div>
    </div>
  )
}

export default ImageWidget
