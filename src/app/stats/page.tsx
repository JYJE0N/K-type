import { Layout } from "@/components/ui/Layout";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { StatsPage } from "@/components/stats/StatsPage";

export default function Page() {
  return (
    <>
      <ThemeInitializer />
      <Layout>
        <StatsPage />
      </Layout>
    </>
  );
}