/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: Success
 */
export default function handler(req, res) {
    res.status(200).json([{ name: "Aminesh" }]);
}