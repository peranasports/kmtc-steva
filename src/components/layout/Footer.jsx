
function Footer() {
    const footerYear = new Date().getFullYear()

    return (
        <footer className="footer p-2 bg-gray-700 text-primary-content footer-center">
            <p>Copyright &copy; Perana Sports {footerYear}. All rights reserved.</p>
        </footer>
    )
}

export default Footer