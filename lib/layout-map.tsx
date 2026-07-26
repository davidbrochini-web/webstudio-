import ClinicoLayout from '@/components/layouts/ClinicoLayout'
import EditorialLayout from '@/components/layouts/EditorialLayout'
import PortfolioLayout from '@/components/layouts/PortfolioLayout'
import UrbanoLayout from '@/components/layouts/UrbanoLayout'
import PerformanceLayout from '@/components/layouts/PerformanceLayout'
import ZenLayout from '@/components/layouts/ZenLayout'
import AcolhedorLayout from '@/components/layouts/AcolhedorLayout'

/** Registro único dos 7 arquétipos — usado tanto pelas vitrines
 *  estáticas (/modelos/[nicho]) quanto pelos sites reais de tenant
 *  (/sandbox/[slug]), pra nunca duplicar esse mapeamento. */
export const layoutByArchetype = {
  clinico: ClinicoLayout,
  editorial: EditorialLayout,
  portfolio: PortfolioLayout,
  urbano: UrbanoLayout,
  performance: PerformanceLayout,
  zen: ZenLayout,
  acolhedor: AcolhedorLayout,
}
