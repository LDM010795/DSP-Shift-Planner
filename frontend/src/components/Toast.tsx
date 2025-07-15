import { motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface ToastProps {
  message: string;
  type: string;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const getToastConfig = (type: string) => {
    switch (type) {
      case "success":
        return {
          bgColor: "bg-green-50/95",
          borderColor: "border-green-200",
          textColor: "text-green-800",
          icon: CheckCircle,
          iconColor: "text-green-600",
        };
      case "error":
        return {
          bgColor: "bg-red-50/95",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          icon: AlertCircle,
          iconColor: "text-red-600",
        };
      case "warning":
        return {
          bgColor: "bg-yellow-50/95",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
          icon: AlertTriangle,
          iconColor: "text-yellow-600",
        };
      case "info":
        return {
          bgColor: "bg-blue-50/95",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
          icon: Info,
          iconColor: "text-blue-600",
        };
      default:
        return {
          bgColor: "bg-white/95",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
          icon: Info,
          iconColor: "text-gray-600",
        };
    }
  };

  const config = getToastConfig(type);
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.3,
      }}
      className={`${config.bgColor} ${config.borderColor} ${config.textColor} backdrop-blur-xl border rounded-2xl p-4 max-w-sm shadow-lg hover:shadow-xl transition-shadow duration-200`}
    >
      <div className="flex items-start space-x-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 600 }}
          className={`${config.iconColor} flex-shrink-0 mt-0.5`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>

        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded-lg hover:bg-white/50"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 4, ease: "linear" }}
        className={`h-1 ${config.borderColor.replace(
          "border-",
          "bg-"
        )} opacity-30 rounded-full mt-3`}
      />
    </motion.div>
  );
}
