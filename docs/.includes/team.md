## Team 
<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://avatars.githubusercontent.com/u/66374113?v=4',
    name: 'Aleksey Tur',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/lesha2r' },
      { icon: 'telegram', link: 'https://t.me/leshatour' }
    ]
  }
]
</script>

<VPTeamMembers size="small" :members />