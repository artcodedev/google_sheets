import axios from "axios";
import { Console } from "./Console";


class Leads {

  static accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjNjMDgxZWU2ZDFhYjc2MzlhZDk0NjljYThlNGQ5NDU3ZTgwN2Q4MTE5M2RlZDYzZTY2ODZjODE4Y2FjOWYzNjNiN2NkODNjN2ExNzQzODIxIn0.eyJhdWQiOiJlZDhiY2E0Mi03NTA5LTQ2MDctOTk0Zi1jNjRhOTM4NjAxY2UiLCJqdGkiOiIzYzA4MWVlNmQxYWI3NjM5YWQ5NDY5Y2E4ZTRkOTQ1N2U4MDdkODExOTNkZWQ2M2U2Njg2YzgxOGNhYzlmMzYzYjdjZDgzYzdhMTc0MzgyMSIsImlhdCI6MTc0MzQwNjkzOCwibmJmIjoxNzQzNDA2OTM4LCJleHAiOjE4MTU2MDk2MDAsInN1YiI6IjE3NTMwOTgiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6MTY0NTc3OTYsImJhc2VfZG9tYWluIjoiYW1vY3JtLnJ1IiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiI2MDI0M2MyYi0zZTllLTRhZGEtYTY5My1mNjNiOWY1YmYxM2IiLCJhcGlfZG9tYWluIjoiYXBpLWIuYW1vY3JtLnJ1In0.iyGue73YmN07f_XVj3kWdV5s8TPrGZQg48zPQKai3-JahkEYt6kHgo9o8PdmVufYgB7PReXO4GacNTdW7gmOZCjrxRMcNQ1OsXRgPcUSJ-Li3-5p_-eSKcaTao5m6DOcn3Kyzpy5UgDBlc8ej8oy1zq3WweiHytpKWqkccW0w4EjsCVMPaNAQXI2FX8oFUejQDjyVGHgzn-Lj0UV2kgbXaWWEu5svmAHH5jgfWo8ytrnniFzNAGNzgeeVCCAm6fTu5IacIXyuosPvhHqkTofN7tKnXIfhDyhoELS2r0Zdu1h9_Nf17B90ffg3qq9ay8O-FxJuYvuRHcRbNzdW72qYA';
  
  static async updateNoteLead(text: string, note_id: string, lead_id: string) {
    try {

      const url_notes = `https://tollroad.amocrm.ru/api/v4/leads/${lead_id}/notes/${note_id}`;

      const data = {
        note_type: 'common',
        text: text
      }

      const response = await axios.patch(url_notes, data, {
        headers: {
          'Authorization': `Bearer ${Leads.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status == 200) {

        return { status: true, data: response.data };
      }

      return { status: false, data: null };
    }
    catch (e: any) {
      Console.error(e)
      return { status: false };
    }
  }

}

export default Leads;

// await Leads.updateNoteLead('121212', '396415735', '31476909');