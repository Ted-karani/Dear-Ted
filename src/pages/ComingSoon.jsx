import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

// Honest stand-in for pages that are not built yet. It has no buttons and saves nothing.
export default function ComingSoon({ title, blurb, phase }) {
  return (
    <div className="page">
      <PageHeader title={title} subtitle={blurb} />
      <Card><p>This page is planned for Phase {phase} of the build. Nothing is saved here yet.</p></Card>
    </div>
  )
}
