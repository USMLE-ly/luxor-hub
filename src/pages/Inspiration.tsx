import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { StyleInspirationFeed } from "@/components/app/StyleInspirationFeed";

const Inspiration = () => {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <StyleInspirationFeed />
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Inspiration;
