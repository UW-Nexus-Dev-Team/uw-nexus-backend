const sgMail = require('@sendgrid/mail');

exports.submitApplication = (req, res) => {

    // assumes all input is validated client-side
    const { to_name, proj_name,
            position, proj_email, major, year, purpose,
            experience, hours, relevantClasses, willMeet,
            resume, coverLetter, extraQuestions
        } = req.body;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to: proj_email,
        from: 'uw.nexus@gmail.com',
        template_id: `${process.env.SENDGRID_APP_SUBMIT_TEMP_ID}`,
        dynamic_template_data: {
            "to_name": to_name,
            "proj_name": proj_name,
            "position": position,
            "major": major,
            "year": year,
            "purpose": purpose,
            "experience": experience,
            "hours": hours,
            "relevantClasses": relevantClasses,
            "willMeet": willMeet,
            "extraQuestions": extraQuestions,
        },
        attachments: [
            {
                content: resume,
                filename: `Resume | ${to_name}`,
                type: "application/pdf",
                disposition: "attachment"
            },

            {
                content: coverLetter,
                filename: `Cover Letter | ${to_name}`,
                type: "application/pdf",
                disposition: "attachment"
            }
        ]
      }

      sgMail
        .send(msg)
        .then(() => {
          console.log('Email sent');
          return res.status(200).send("Successfully sent email");
        })
        .catch((error) => {
          console.error(error);
          return res.status(500).send("Email not sent. Try again later.");
        });
}

exports.resetPassword = (req, res) => {
    const {to_name, to_email, reset_link} = req.body;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to: to_email,
        from: 'uw.nexus@gmail.com',
        template_id: `${process.env.SENDGRID_PASS_RESET_TEMP_ID}`,
        dynamic_template_data: {
            to_name: to_name,
            message: reset_link
        }
    }

    sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
      return res.status(200).send("Successfully sent email");
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).send("Email not sent. Try again later.");
    });
}



