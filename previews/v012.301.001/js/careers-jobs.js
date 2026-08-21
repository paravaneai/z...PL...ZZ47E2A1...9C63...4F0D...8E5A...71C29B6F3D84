(function () {
    "use strict";

    function esc(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"../g, "&quot;").replace(/'../g, "&#39;");
    }

    function dateLabel(value) {
        return new Intl.DateTimeFormat("en-US", {
            month: "short", day: "numeric", year: "numeric", timeZone: "UTC"
        }).format(new Date(value + "T12:00:00Z"));
    }

    function activeJobs(data) {
        return (data.jobs || []).filter(function (job) { return job.active !== false; });
    }

    function unique(jobs, key) {
        return jobs.map(function (job) { return job[key]; }).filter(Boolean)
            .filter(function (value, index, values) { return values.indexOf(value) === index; }).sort();
    }

    function syncSelectWidth(select) {
        if (!select) return;
        var longest = Array.prototype.reduce.call(select.options, function (length, option) {
            return Math.max(length, option.textContent.trim().length);
        }, 0);
        var field = select.closest(".careers-control-field");
        if (field) field.style.setProperty("--careers-select-width", Math.min(30, Math.max(14, longest + 5)) + "ch");
    }

    function jobPath(job) {
        return "../pages/careers/jobs/" + encodeURIComponent(job.slug) + "/" + encodeURIComponent(job.id) + "/";
    }

    function roleRow(job) {
        return '<a class="careers-job-row" href="' + jobPath(job) + '">' +
            '<span class="careers-job-row-title"><strong>' + esc(job.title) + '</strong><small>' + esc(job.employmentType) + '</small></span>' +
            '<span class="careers-job-row-context"><span>' + esc(job.department) + '</span><span>' + esc(job.location) + '</span></span>' +
            '<time datetime="' + esc(job.datePosted) + '">' + esc(dateLabel(job.datePosted)) + '</time>' +
            '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>';
    }

    function renderDirectory(root, jobs) {
        var list = root.querySelector("[data-jobs-list]");
        var count = root.querySelector("[data-jobs-count]");
        var search = root.querySelector("[data-jobs-search]");
        var department = root.querySelector("[data-jobs-department]");
        var location = root.querySelector("[data-jobs-location]");
        var sort = root.querySelector("[data-jobs-sort]");
        var controls = root.querySelector("[data-jobs-controls]");
        if (controls) controls.hidden = false;

        [[department, "department"], [location, "location"]].forEach(function (pair) {
            if (!pair[0]) return;
            unique(jobs, pair[1]).forEach(function (value) {
                pair[0].insertAdjacentHTML("beforeend", '<option value="' + esc(value) + '">' + esc(value) + '</option>');
            });
        });
        [department, location, sort].forEach(syncSelectWidth);

        function update() {
            var query = search ? search.value.trim().toLowerCase() : "";
            var filtered = jobs.filter(function (job) {
                var text = [job.title, job.department, job.team, job.location, job.employmentType].join(" ").toLowerCase();
                return (!query || text.indexOf(query) >= 0) &&
                    (!department || !department.value || job.department === department.value) &&
                    (!location || !location.value || job.location === location.value);
            });
            var order = sort ? sort.value : "newest";
            filtered.sort(function (a, b) {
                if (order === "title") return a.title.localeCompare(b.title);
                if (order === "location") return a.location.localeCompare(b.location) || a.title.localeCompare(b.title);
                return -1 * a.datePosted.localeCompare(b.datePosted);
            });
            var matchingCount = filtered.length;
            if (root.dataset.directoryMode === "preview") filtered = filtered.slice(0, 3);
            if (count) count.textContent = matchingCount + (matchingCount === 1 ? " open role" : " open roles");
            document.querySelectorAll("[data-open-role-count]").forEach(function (node) {
                node.textContent = jobs.length + (jobs.length === 1 ? " current role" : " current roles");
            });
            document.querySelectorAll("[data-open-role-status]").forEach(function (node) {
                var hasOpenRoles = jobs.length > 0;
                node.textContent = hasOpenRoles ? "Open roles" : "No open roles";
                node.classList.toggle("is-empty", !hasOpenRoles);
                node.setAttribute("aria-label", hasOpenRoles ? jobs.length + (jobs.length === 1 ? " open role" : " open roles") : "No open roles");
            });
            list.innerHTML = filtered.length ? filtered.map(roleRow).join("") :
                '<div class="careers-jobs-empty"><strong>No open roles match.</strong><span>Adjust the filters or check back later.</span></div>';
        }
        [search, department, location, sort].forEach(function (control) {
            if (control) control.addEventListener(control.tagName === "INPUT" ? "input" : "change", update);
        });
        update();
    }

    function paragraphs(values) {
        return values.map(function (value) { return "<p>" + esc(value) + "</p>"; }).join("");
    }

    function bullets(values) {
        return "<ul>" + values.map(function (value) { return "<li>" + esc(value) + "</li>"; }).join("") + "</ul>";
    }

    function section(title, content, modifier) {
        var className = "careers-job-copy-section" + (modifier ? " " + modifier : "");
        return '<section class="' + className + '"><h2>' + esc(title) + "</h2>" + content + "</section>";
    }

    function policySection(title, content) {
        return section(title, content, "careers-job-copy-section-policy");
    }

    function salaryRange(job) {
        var source = job && job.salaryRange;
        if (!source) return null;
        var minimum = Number(source.minimum);
        var maximum = Number(source.maximum);
        if (!Number.isFinite(minimum) || !Number.isFinite(maximum) || minimum < 0 || maximum < minimum) return null;
        var currency = String(source.currency || "USD").toUpperCase();
        var period = String(source.period || "YEAR").toUpperCase();
        var fractionDigits = Number.isInteger(minimum) && Number.isInteger(maximum) ? 0 : 2;
        var formatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits
        });
        return {
            currency: currency,
            minimum: minimum,
            maximum: maximum,
            period: period,
            display: formatter.format(minimum) + "\u2013" + formatter.format(maximum) + " " + currency
        };
    }

    function compensationCopy(salary) {
        return [
            "<p>Paravane's compensation structure generally consists of an annual base salary and does not include performance bonuses.</p>",
            "<p>We determine compensation using relevant market data while considering the scope and responsibilities of the role, job family, and each candidate's background, skills, experience, and qualifications.</p>",
            salary ? "<p>The annual base salary range for this role is <strong>" + esc(salary.display) + "</strong>. Individual compensation within this range will vary based on the factors above and other considerations permitted by applicable law.</p>" : ""
        ].join("");
    }

    function evergreenJobSections(salary) {
        return policySection("Compensation", compensationCopy(salary)) +
            policySection("Equal Opportunity & Inclusion", [
                "<p>Paravane is committed to building a team with different backgrounds, experiences, perspectives, and ways of thinking. We believe that bringing different voices together helps us build stronger products, make better decisions, and better understand the people and organizations our technology serves.</p>",
                "<p>Paravane is an equal opportunity employer. We provide employment opportunities without regard to race, color, religion or religious creed, national origin, ancestry, citizenship status, sex, pregnancy, childbirth or related medical conditions, sexual orientation, gender, gender identity or expression, age, physical or mental disability, medical condition, genetic information, marital status, military or veteran status, or any other characteristic protected by applicable federal, state, or local law.</p>",
                "<p>We take inclusion seriously and are committed to maintaining a workplace where people are treated with dignity, fairness, and respect.</p>",
                "<p><strong>EOE, including disability and protected veteran status.</strong></p>"
            ].join("")) +
            policySection("Accommodations", [
                "<p>We want every candidate to have a meaningful and accessible interview experience.</p>",
                "<p>If you require a reasonable accommodation or adjustment during the application or interview process because of a disability, medical condition, or other applicable need, please let your Paravane recruiting contact know. We will work with you to support your participation in the hiring process.</p>",
                "<p>You do not need to disclose more information than is reasonably necessary for us to understand and arrange the requested accommodation.</p>"
            ].join("")) +
            policySection("Recruiting Agencies", [
                "<p>Paravane does not accept unsolicited resumes, candidate profiles, or other submissions from staffing agencies or third-party recruiters.</p>",
                "<p>Agencies may submit candidates only when they have received prior written authorization from Paravane and are acting under an applicable written recruiting agreement.</p>",
                "<p>Any resume or candidate information submitted without prior authorization will be considered an unsolicited submission, and Paravane will have no obligation to pay any referral, placement, recruiting, or other fee in connection with that candidate.</p>",
                "<p>Recruiting agencies and third-party recruiters should not contact Paravane employees, hiring managers, or executives regarding open positions unless specifically authorized to do so.</p>"
            ].join(""));
    }

    function application(job) {
        return '<div class="form-shell careers-form-shell"><form id="careers-form" class="site-form" action="../v1/careers/apply" method="post" enctype="multipart/form-data" data-api-form="careers" data-success-redirect="../pages/careers/jobs/application-received/" aria-label="Application for ' + esc(job.title) + '">' +
            '<input type="hidden" name="job_id" value="' + esc(job.id) + '"><input type="hidden" name="job_slug" value="' + esc(job.slug) + '"><input type="hidden" name="job_title" value="' + esc(job.title) + '"><input type="hidden" name="area_of_interest" value="' + esc(job.department) + '">' +
            '<div class="careers-form-heading"><p class="kicker">Apply for this role</p><h2>Your application</h2><p>Applying for <strong>' + esc(job.title) + '</strong>. Required fields must be completed.</p></div><div class="form-grid">' +
            '<label class="field"><span>Full name</span><input type="text" name="name" autocomplete="name" maxlength="120" required></label>' +
            '<label class="field"><span>Email</span><input type="email" name="email" autocomplete="email" maxlength="254" required></label>' +
            '<label class="field"><span>Phone</span><input type="tel" name="phone" autocomplete="tel" maxlength="40" placeholder="Optional"></label>' +
            '<label class="field"><span>Location</span><input type="text" name="location" autocomplete="address-level2" maxlength="120" required></label>' +
            '<label class="field"><span>LinkedIn profile</span><input type="url" name="linkedin_url" inputmode="url" maxlength="500" placeholder="https://linkedin.com/in/..."></label>' +
            '<label class="field"><span>Portfolio or website</span><input type="url" name="portfolio_url" inputmode="url" maxlength="500" placeholder="https://your-work.example"></label>' +
            '<label class="field field-wide"><span>Cover note</span><textarea name="message" rows="7" maxlength="4000" placeholder="Tell us how your experience connects to this role." required></textarea></label>' +
            '<label class="field field-wide careers-upload"><span>Resume</span><input type="file" name="resume" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required><small class="careers-field-help">PDF, DOC, or DOCX. Maximum file size: 5 MB.</small></label>' +
            '<label class="field field-trap" aria-hidden="true"><span>Website</span><input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
            '<label class="careers-consent"><input type="checkbox" name="consent" value="true" required><span>I consent to Paravane Labs using this information to evaluate my candidacy and contact me about employment opportunities. See the <a href="../pages/legal/privacy">Privacy Notice</a>.</span></label></div>' +
            '<div class="form-footer"><span class="form-status" data-form-status role="status" aria-live="polite"></span><button class="btn btn-primary" type="submit">Send application</button></div></form></div>';
    }

    function addJobSchema(job) {
        var schema = {"@context":"https://schema.org","@type":"JobPosting","title":job.title,
            "description":job.summary + " " + job.description.join(" "),"datePosted":job.datePosted,
            "employmentType":job.employmentType.toUpperCase().replace(/\s+/g,"_"),
            "identifier":{"@type":"PropertyValue","name":"Paravane Labs","value":job.id},
            "hiringOrganization":{"@type":"Organization","name":"Paravane Labs","sameAs":"https://paravane.io/"},
            "jobLocationType":"TELECOMMUTE","applicantLocationRequirements":{"@type":"Country","name":"United States"},
            "url":"https://paravane.io" + jobPath(job)};
        var salary = salaryRange(job);
        if (salary) {
            schema.baseSalary = {
                "@type": "MonetaryAmount",
                "currency": salary.currency,
                "value": {
                    "@type": "QuantitativeValue",
                    "minValue": salary.minimum,
                    "maxValue": salary.maximum,
                    "unitText": salary.period
                }
            };
        }
        var node = document.createElement("script");
        node.type = "application/ld+json"; node.dataset.jobSchema = ""; node.textContent = JSON.stringify(schema);
        document.head.appendChild(node);
    }

    function syncJobMetadata(job) {
        var absoluteUrl = "https://paravane.io" + jobPath(job);
        var title = job.title + " | Careers at Paravane";
        document.title = title;
        var canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.href = absoluteUrl;
        var description = document.querySelector('meta[name="description"]');
        if (description) description.content = job.summary;
        var values = { "og:title": title, "og:description": job.summary, "og:url": absoluteUrl };
        Object.keys(values).forEach(function (property) {
            var node = document.querySelector('meta[property="' + property + '"]');
            if (node) node.content = values[property];
        });
    }

    function renderDetail(root, jobs) {
        var routeParts = location.pathname.split("/").filter(Boolean);
        var slug = root.dataset.jobSlug || routeParts[routeParts.length - 2];
        var jobId = root.dataset.jobId || routeParts[routeParts.length - 1];
        var job = jobs.find(function (item) { return item.slug === slug && item.id === jobId; });
        var copy = root.querySelector("[data-job-description]");
        var apply = root.querySelector("[data-job-application]");
        if (!job) {
            root.querySelector("[data-job-title]").textContent = "Role not found";
            copy.innerHTML = '<div class="careers-jobs-empty"><strong>This role is not currently available.</strong><a class="btn btn-secondary" href="../pages/careers/jobs/">View open roles</a></div>';
            apply.remove(); return;
        }
        syncJobMetadata(job);
        var salary = salaryRange(job);
        root.querySelector("[data-job-title]").textContent = job.title;
        root.querySelector("[data-job-department]").textContent = job.department;
        root.querySelector("[data-job-meta]").innerHTML =
            '<span><i class="fa-solid fa-location-dot"></i>' + esc(job.location) + '</span><span><i class="fa-solid fa-clock"></i>' + esc(job.employmentType) + '</span><span><i class="fa-solid fa-briefcase"></i>' + esc(job.experience) + '</span>' +
            (salary ? '<span><i class="fa-solid fa-money-bill-wave"></i>Salary range: ' + esc(salary.display) + '</span>' : '') +
            '<span><i class="fa-regular fa-calendar"></i>Posted ' + esc(dateLabel(job.datePosted)) + '</span>';
        copy.innerHTML = section("About Paravane", paragraphs(job.aboutParavane)) + section("About the role", '<p class="careers-job-summary">' + esc(job.summary) + "</p>" + paragraphs(job.description)) + section("What you'll do", bullets(job.responsibilities)) + section("What you bring", bullets(job.qualifications)) + evergreenJobSections(salary);
        apply.innerHTML = application(job); addJobSchema(job);
        document.dispatchEvent(new CustomEvent("paravane:forms-ready"));
    }

    function loadJobs() {
        return fetch("../v1/careers/jobs", {credentials:"same-origin", headers:{"Accept":"application/json"}}).then(function (response) {
            if (!response.ok) throw new Error(); return response.json();
        }).catch(function () {
            return fetch("../data/jobs.json", {credentials:"same-origin"}).then(function (response) {
                if (!response.ok) throw new Error(); return response.json();
            });
        });
    }

    var loadingRoots = document.querySelectorAll("[data-jobs-directory], [data-job-detail]");
    var pageTransition = window.ParavanePageTransition;
    var routeLoaderHeld = false;

    loadingRoots.forEach(function (root) { root.setAttribute("aria-busy", "true"); });
    if (loadingRoots.length && pageTransition && typeof pageTransition.setBusy === "function") {
        pageTransition.setBusy(true);
        routeLoaderHeld = true;
    }

    function finishLoading() {
        loadingRoots.forEach(function (root) { root.removeAttribute("aria-busy"); });
        if (routeLoaderHeld) {
            pageTransition.setBusy(false);
            routeLoaderHeld = false;
        }
    }

    loadJobs().then(function (data) {
        var jobs = activeJobs(data);
        document.querySelectorAll("[data-jobs-directory]").forEach(function (root) { renderDirectory(root, jobs); });
        var detail = document.querySelector("[data-job-detail]"); if (detail) renderDetail(detail, jobs);
    }).catch(function () {
        document.querySelectorAll("[data-jobs-list]").forEach(function (list) { list.innerHTML = '<div class="careers-jobs-empty"><strong>Open roles are temporarily unavailable.</strong><span>Please check back shortly.</span></div>'; });
        var apply = document.querySelector("[data-job-application]"); if (apply) apply.remove();
    }).then(finishLoading, finishLoading);
})();
