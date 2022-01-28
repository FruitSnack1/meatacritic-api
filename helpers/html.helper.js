import axios from 'axios'

class HtmlHelper {
  async getHtml(url) {
    const res = await axios.get(url)
    return res.data
  }
}

const htmlHelper = new HtmlHelper()
export default htmlHelper
